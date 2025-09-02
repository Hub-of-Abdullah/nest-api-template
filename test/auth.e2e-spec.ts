import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from '../src/api/auth/auth.module';
import { UsersModule } from '../src/api/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from '../src/api/users/schema/user.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: Model<User>;
  
  const testUser = {
    _id: new Types.ObjectId(),
    name: 'Test User',
    employeeCode: '107777',
    phone: '+1234567890',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    // Clear database and seed test data
    await userModel.deleteMany({});
    await userModel.create(testUser);
  });

  describe('POST /auth/login', () => {
    it('should successfully initiate login with valid employee code', async () => {
      const loginData = {
        employeeCode: '107777',
        deviceId: 'test-device-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Jest Test Agent',
        browserFingerprint: 'test-fingerprint',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('message', 'OTP sent to your phone');
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      
      // Should set OTP token cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie: string) => cookie.includes('otp_token'))).toBe(true);
    });

    it('should return 404 for non-existent employee code', async () => {
      const loginData = {
        employeeCode: '999999',
        deviceId: 'test-device-123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 422 for invalid input data', async () => {
      const loginData = {
        // Missing required employeeCode
        deviceId: 'test-device-123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should return 422 for empty employee code', async () => {
      const loginData = {
        employeeCode: '',
        deviceId: 'test-device-123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });

  describe('POST /auth/verify/otp', () => {
    let otpToken: string;

    beforeEach(async () => {
      // First perform login to get OTP token
      const loginData = {
        employeeCode: '107777',
        deviceId: 'test-device-123',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData);

      otpToken = loginResponse.body.token;
    });

    it('should return 422 for missing OTP', async () => {
      const otpData = {
        // Missing otp
        deviceId: 'test-device-123',
      };

      await request(app.getHttpServer())
        .post('/auth/verify/otp')
        .set('Cookie', [`otp_token=${otpToken}`])
        .send(otpData)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should return 401 for missing OTP token cookie', async () => {
      const otpData = {
        otp: '123456',
        deviceId: 'test-device-123',
      };

      await request(app.getHttpServer())
        .post('/auth/verify/otp')
        .send(otpData)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 401 for invalid OTP token', async () => {
      const otpData = {
        otp: '123456',
        deviceId: 'test-device-123',
      };

      await request(app.getHttpServer())
        .post('/auth/verify/otp')
        .set('Cookie', ['otp_token=invalid-token'])
        .send(otpData)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 401 for unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login endpoint', async () => {
      const loginData = {
        employeeCode: '107777',
        deviceId: 'test-device-123',
      };

      // Make multiple requests quickly to trigger rate limit
      const requests = Array(6).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => 
        r.status === HttpStatus.TOO_MANY_REQUESTS
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000); // Increase timeout for rate limiting test
  });
});