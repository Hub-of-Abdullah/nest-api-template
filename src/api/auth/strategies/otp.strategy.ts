// otp.strategy.ts
import { Strategy } from "passport-custom";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { Request } from "express";
import { OtpService } from "src/api/otp/otp.service";

@Injectable()
export class OtpStrategy extends PassportStrategy(Strategy, "otp") {
  constructor(
    private authService: AuthService,
    private readonly otpService: OtpService,
  ) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const { otp } = req.body; // Get OTP data from body
    const otpToken = req.cookies?.otp_token; // JWT from cookies

    if (!otpToken) {
      throw new UnauthorizedException("OTP token missing");
    }
    // if (!otp || !deviceId) {
    //     throw new UnauthorizedException('OTP and device ID are required');
    // }
    if (!otp) {
      throw new UnauthorizedException("OTP is required");
    }
    // Decode JWT to get employeeCode
    const payload = await this.authService.decodeOtpToken(otpToken);

    if (!payload?.employeeCode) {
      throw new UnauthorizedException("Invalid OTP token");
    }

    const user = await this.authService.getUserByEmployeeCode(
      payload.employeeCode,
    );
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Validate OTP against DB
    const isValid = await this.otpService.verifyOtp(
      payload.employeeCode,
      otp,
      otpToken,
    );
    if (!isValid) {
      throw new UnauthorizedException("Invalid OTP");
    }
    return user; // Passport attaches this to req.user
  }
}
