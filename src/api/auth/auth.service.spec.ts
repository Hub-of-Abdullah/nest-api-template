import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { Session } from './schema/auth-session.schema';
import { LoginReqDto, OTPDto } from './dto/login.req.dto';
import { Types } from 'mongoose';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let otpService: jest.Mocked<OtpService>;
  let jwtService: jest.Mocked<JwtService>;
  let sessionModel: any;

  const mockUser = {
    _id: new Types.ObjectId(),
    name: 'Test User',
    employeeCode: '107777',
    phone: '+1234567890',
    role: 'user',
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const mockSessionModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      deleteMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getUser: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            issue: jest.fn(),
            verifyOtp: jest.fn(),
            consume: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: getModelToken(Session.name),
          useValue: mockSessionModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    otpService = module.get(OtpService) as jest.Mocked<OtpService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    sessionModel = module.get(getModelToken(Session.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginReqDto = {
      employeeCode: '107777',
      deviceId: 'device-123',
      ipAddress: '192.168.1.1',
      userAgent: 'test-agent',
      browserFingerprint: 'fingerprint-123',
    };

    it('should successfully initiate login process', async () => {
      const mockOtp = '123456';
      const mockToken = 'mock-jwt-token';

      usersService.getUser.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue(mockToken);
      otpService.issue.mockResolvedValue(mockOtp);

      const result = await service.login(loginDto, mockResponse);

      expect(usersService.getUser).toHaveBeenCalledWith({
        employeeCode: loginDto.employeeCode,
      });
      expect(jwtService.sign).toHaveBeenCalled();
      expect(otpService.issue).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'OTP sent to your phone',
        token: mockToken,
      });
    });

    it('should throw error if user not found', async () => {
      usersService.getUser.mockRejectedValue(new Error('User not found'));

      await expect(service.login(loginDto, mockResponse)).rejects.toThrow();
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const mockToken = 'generated-token';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.generateToken(
        mockUser as any,
        900000,
        'secret'
      );

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          userId: mockUser._id.toHexString(),
          employeeCode: mockUser.employeeCode,
          role: mockUser.role,
        },
        {
          secret: 'secret',
          expiresIn: '900000ms',
        }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      sessionModel.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const result = await service.logout(mockUser as any, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(sessionModel.deleteMany).toHaveBeenCalledWith({
        employeeCode: mockUser.employeeCode,
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});