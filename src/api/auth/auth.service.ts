import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { compare, hash } from "bcryptjs";
import { User } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";
import { Response } from "express";
import { TokenPayload } from "./token-payload.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LoginReqDto, OTPDto } from "./dto/login.req.dto";
import { appConfig } from "src/config/config";
import { clearCookie, setCookie } from "src/utils/cookies";
import { OtpService } from "../otp/otp.service";
import * as jwt from "jsonwebtoken";
import { JwtService } from "@nestjs/jwt";
import { Session } from "./schema/auth-session.schema";
import { TokenNames } from "src/constants/app.constant";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async login(userLogin: LoginReqDto, response: Response): Promise<any> {
    const now = new Date();
    // 1. check if user exists
    // 2. collect device info
    // 3. create jwt otp token and set in httpOnly cookie
    // 4. create otp and send to user

    const user = await this.usersService.getUser({
      employeeCode: userLogin.employeeCode,
    });
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
      employeeCode: userLogin.employeeCode,
    };
    const tempToken = this.jwtService.sign(tokenPayload, {
      secret: appConfig.jwt.otpSecret,
      expiresIn: `${appConfig.otp.expirationTime}ms`,
    });
    const otp = await this.otpService.issue(
      userLogin.employeeCode,
      tempToken,
      appConfig.otp.tokenExpirationTime,
    );
    setCookie(
      response,
      TokenNames.OTP_TOKEN,
      tempToken,
      now.getTime() + appConfig.otp.expirationTime,
    );

    // TODO: send OTP via SMS provider here
    console.log("otp", otp);
    // Store temporary token for OTP in db

    return { message: "OTP sent to your phone", token: tempToken };
    // return {
    //   user: {
    //     id: user._id.toHexString()
    //   },
    // };
  }

  async verifyOtp(otpDto: OTPDto, tempToken: string, response: Response) {
    if (!tempToken) {
      throw new UnauthorizedException("OTP token is missing");
    }
    // Decode and verify OTP token
    let payload: { employeeCode: string; exp: number };
    try {
      payload = jwt.verify(tempToken, appConfig.jwt.otpSecret) as {
        employeeCode: string;
        exp: number;
      };
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedException("OTP token has expired");
      }
      throw new UnauthorizedException("Invalid OTP token");
    }

    const { employeeCode } = payload;
    if (!employeeCode) {
      throw new UnauthorizedException("Invalid OTP token payload");
    }

    // Verify OTP
    const isOtpValid = await this.otpService.verifyOtp(
      employeeCode,
      otpDto.otp,
      tempToken,
    );
    if (!isOtpValid) {
      throw new UnauthorizedException("Invalid or expired OTP");
    }

    // Validate device (implement actual logic later)
    const isDeviceValid = true;
    if (!isDeviceValid) {
      throw new UnauthorizedException("Invalid device");
    }

    // Check if user exists
    const user = await this.usersService.getUser({ employeeCode });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    clearCookie(response, "otp_token");
    const accessToken = await this.generateToken(
      user,
      appConfig.jwt.accessExpiresIn,
      appConfig.jwt.accessSecret,
    );
    const refreshToken = await this.generateToken(
      user,
      appConfig.jwt.refreshExpiresIn,
      appConfig.jwt.refreshSecret,
    );

    this.setTokenInCookies(accessToken, refreshToken, response);

    await this.createOrReplaceSession(
      user.employeeCode,
      refreshToken,
      appConfig.jwt.refreshExpiresIn,
      "web",
    );

    return {
      message: "OTP verified successfully",
      user: {
        id: user._id,
        employeeCode: user.employeeCode,
        name: user.name,
        role: user.role,
      },
    };
  }

  async generateToken(
    user: User,
    expiresIn: string | number,
    secret: string,
  ): Promise<string> {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
      employeeCode: user.employeeCode,
      role: user.role,
    };

    console.log("tokenPayload", tokenPayload);

    try {
      const token = this.jwtService.sign(tokenPayload, {
        secret: secret,
        expiresIn: `${expiresIn}ms`,
      });
      return token;
    } catch (error) {
      throw new InternalServerErrorException("Failed to generate token");
    }
  }

  async generateToken1(
    user: any,
    expiresIn: string | number,
    secret: string,
  ): Promise<string> {
    const tokenPayload: TokenPayload = {
      userId: user.userId,
      employeeCode: user.employeeCode,
      role: user.role,
    };

    console.log("tokenPayload", tokenPayload);

    try {
      const token = this.jwtService.sign(tokenPayload, {
        secret: secret,
        expiresIn: `${expiresIn}ms`,
      });
      return token;
    } catch (error) {
      throw new InternalServerErrorException("Failed to generate token");
    }
  }

  async createOrReplaceSession(
    employeeCode: string,
    refreshToken: string,
    ttlMs = 7 * 24 * 60 * 60 * 1000, // default 7 days in ms
    deviceId?: string,
  ) {
    // Remove existing sessions
    await this.sessionModel.deleteMany({ employeeCode });

    // Hash the refresh token
    const hashedRefreshToken = await hash(refreshToken, 12);

    // Ensure ttlMs is a number
    ttlMs = Number(ttlMs) || 7 * 24 * 60 * 60 * 1000;

    // Calculate expiresAt in milliseconds
    const expiresAt = new Date(Date.now() + ttlMs);

    // Create session
    return this.sessionModel.create({
      employeeCode,
      refreshToken: hashedRefreshToken,
      expiresAt,
      deviceId,
    });
  }

  async verifyUserSession(
    refreshToken: string,
    employeeCode: string,
  ): Promise<boolean> {
    const session = await this.sessionModel.findOne({ employeeCode });
    if (!session) {
      throw new UnauthorizedException("Session not found");
    }
    // Compare hashed refresh token from DB
    const isRefreshTokenValid = await compare(
      refreshToken,
      session.refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException("Refresh token mismatch");
    }

    // // Optional: Verify JWT payload if needed
    // const payload = await this.jwtService.verifyAsync(refreshToken, {
    //   secret: appConfig.jwt.refreshSecret,
    // });

    // console.log("payload", payload);

    // if (!payload || payload.employeeCode !== employeeCode) {
    //   throw new UnauthorizedException('Invalid refresh token');
    // }

    // Check session expiry in DB
    if (session.expiresAt && session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session expired");
    }

    return true;
  }

  async verifyUserByEmployeeCode(employeeCode: string) {
    try {
      const user = await this.usersService.getUser({ employeeCode });
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException("Credentials are not valid.");
    }
  }

  async setTokenInCookies(accessToken: string,refreshToken: string,res: Response) {
    const now = new Date();
    setCookie( res, TokenNames.ACCESS_TOKEN, accessToken, now.getTime() + appConfig.jwt.cookieExpiresIn);
    setCookie(res, TokenNames.REFRESH_TOKEN, refreshToken, now.getTime() + appConfig.jwt.cookieExpiresIn);
  }

  async decodeOtpToken(token: string) {
    try {
      return jwt.verify(token, appConfig.jwt.otpSecret) as {
        employeeCode: string;
        otp: string;
      };
    } catch (err) {
      return null;
    }
  }

  async getUserByEmployeeCode(employeeCode: string) {
    return this.usersService.getUser({ employeeCode });
  }

  // async generateTokensAndSession(user: User, res: Response) {
  //   const accessToken = await this.generateToken(
  //     user,
  //     appConfig.jwt.accessExpiresIn,
  //     appConfig.jwt.accessSecret,
  //   );
  //   const refreshToken = await this.generateToken(
  //     user,
  //     appConfig.jwt.refreshExpiresIn,
  //     appConfig.jwt.refreshSecret,
  //   );

  //   this.setTokenInCookies(accessToken, refreshToken, res);
  //   await this.createOrReplaceSession(
  //     user.employeeCode,
  //     refreshToken,
  //     appConfig.jwt.refreshExpiresIn,
  //     "web",
  //   );

  //   return {
  //     message: "OTP verified successfully",
  //     user: {
  //       id: user._id,
  //       employeeCode: user.employeeCode,
  //       name: user.name,
  //       role: user.role,
  //     },
  //   };
  // }

  async logout(user: User, response: Response) {
    response.clearCookie(TokenNames.ACCESS_TOKEN);
    response.clearCookie(TokenNames.REFRESH_TOKEN);
    this.sessionModel.deleteMany({ employeeCode: user.employeeCode });
    return { message: "Logged out successfully" };
  }

}
