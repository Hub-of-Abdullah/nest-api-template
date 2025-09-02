import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UsersModule } from '../src/api/users/users.module';
import { AuthModule } from '../src/api/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from '../src/api/users/schema/user.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from '../src/config/config';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: Model<User>;
  let jwtService: JwtService;
  
  const testUser = {
    _id: new Types.ObjectId(),
    name: 'Test User',
    employeeCode: '107777',
    phone: '+1234567890',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testUser2 = {
    _id: new Types.ObjectId(),
    name: 'Test User 2',
    employeeCode: '108888',
    phone: '+1234567891',
    role: 'admin',
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
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    // Clear database and seed test data
    await userModel.deleteMany({});
    await userModel.create([testUser, testUser2]);
  });

  // Helper function to generate valid JWT token
  const generateAccessToken = (user: any) => {
    const payload = {
      userId: user._id.toString(),
      employeeCode: user.employeeCode,
      role: user.role,
    };
    
    return jwtService.sign(payload, {
      secret: appConfig.jwt.accessSecret,
      expiresIn: '15m',
    });
  };

  describe('GET /users/me', () => {
    it('should return current user profile with valid token', async () => {
      const accessToken = generateAccessToken(testUser);

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', testUser.name);
      expect(response.body).toHaveProperty('employeeCode', testUser.employeeCode);
      expect(response.body).toHaveProperty('role', testUser.role);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 for missing authentication token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 401 for invalid authentication token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', ['accessToken=invalid-token'])
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 401 for expired token', async () => {
      const expiredPayload = {
        userId: testUser._id.toString(),
        employeeCode: testUser.employeeCode,
        role: testUser.role,
      };
      
      const expiredToken = jwtService.sign(expiredPayload, {
        secret: appConfig.jwt.accessSecret,
        expiresIn: '-1h', // Expired 1 hour ago
      });

      await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', [`accessToken=${expiredToken}`])
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /users', () => {
    it('should return paginated list of users with valid token', async () => {
      const accessToken = generateAccessToken(testUser);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('employeeCode');
      expect(response.body[0]).not.toHaveProperty('password');
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respect pagination parameters', async () => {
      const accessToken = generateAccessToken(testUser);

      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ limit: 1, page: 1 })
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(1);
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      const accessToken = generateAccessToken(testUser);

      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ limit: -1, page: 0 })
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on users endpoints', async () => {
      const accessToken = generateAccessToken(testUser);

      // Make multiple requests quickly to trigger rate limit
      const requests = Array(12).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/users/me')
          .set('Cookie', [`accessToken=${accessToken}`])
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => 
        r.status === HttpStatus.TOO_MANY_REQUESTS
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000); // Increase timeout for rate limiting test
  });

  describe('Error Handling', () => {
    it('should return proper error format for validation errors', async () => {
      const accessToken = generateAccessToken(testUser);

      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ limit: 'invalid' }) // Invalid limit parameter
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle server errors gracefully', async () => {
      const accessToken = generateAccessToken({
        _id: 'invalid-id', // This will cause a server error
        employeeCode: 'invalid',
        role: 'user',
      });

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toHaveProperty('statusCode', HttpStatus.UNAUTHORIZED);
    });
  });
});