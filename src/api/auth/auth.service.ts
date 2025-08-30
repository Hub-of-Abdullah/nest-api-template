import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { DeviceSessionsService } from "../device-sessions/device-sessions.service";
import { OtpService } from "../otp/otp.service";
import { SessionsService } from "../sessions/sessions.service";
import { console } from "inspector";
import { TokenPayload } from "./token-payload.interface";
import { OTPDto } from "./dto/login.req.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly deviceSessions: DeviceSessionsService,
    private readonly otpService: OtpService,
    private readonly sessions: SessionsService,
  ) {}

  async validateEmployeeCode(employeeCode: string) {
    return this.users.findByEmployeeCode(employeeCode);
  }

  async loginWithEmployeeCode(dto: {
    employeeCode: string;
    deviceId: string;
    ipAddress?: string;
    userAgent?: string;
    browserFingerprint?: any;
  }) {
    const user = await this.validateEmployeeCode(dto.employeeCode);
    if (!user) throw new UnauthorizedException("Invalid employee code");

    // Step 1.2: If any existing device session for employee, remove it (single device rule)
    await this.deviceSessions.removeAllByEmployeeCode(dto.employeeCode);

    // Create/activate current device session
    await this.deviceSessions.upsertActive({
      employeeCode: dto.employeeCode,
      deviceId: dto.deviceId,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      browserFingerprint: dto.browserFingerprint
        ? JSON.stringify(dto.browserFingerprint)
        : undefined,
    });

    const tempToken = this.jwt.sign(
      { sub: String(user._id), employeeCode: user.employeeCode, step: "otp" },
      { expiresIn: "5m", secret: process.env.JWT_SECRET },
    );
    // Step 2: OTP + Temporary token (5 min) for OTP verification step
    const otp = await this.otpService.issue(dto.employeeCode, tempToken, 300);
    // TODO: send OTP via SMS provider here
    console.log("otp", otp);
    // Store temporary token for OTP in db

    return { message: "OTP sent to your phone", token: tempToken };
  }

  async verifyOtp(user: TokenPayload, dto: OTPDto, token: string) {
    const ok = await this.otpService.verify(user.employeeCode, dto.otp, token);
    if (!ok) throw new UnauthorizedException("Invalid OTP");
    await this.otpService.consume(user.employeeCode);

    // Step 4: Remove existing sessions (single device auth session)
    await this.sessions.revokeAll(user.employeeCode);

    // Issue tokens
    const accessToken = this.jwt.sign(
      { sub: user.sub, employeeCode: user.employeeCode, role: user.role },
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        secret: process.env.JWT_SECRET,
      },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.sub, employeeCode: user.employeeCode },
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    await this.sessions.createOrReplaceForEmployee(
      user.employeeCode,
      refreshToken,
      7,
    );

    return { accessToken, refreshToken };
  }

  async rotateTokens(employeeCode: string, oldRefreshToken: string) {
    const session = await this.sessions.findValid(
      employeeCode,
      oldRefreshToken,
    );
    if (!session) throw new UnauthorizedException("Invalid refresh session");

    const user = await this.validateEmployeeCode(employeeCode);
    if (!user) throw new UnauthorizedException("User not found");

    const accessToken = this.jwt.sign(
      {
        sub: String(user._id),
        employeeCode: user.employeeCode,
        role: user.role,
      },
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        secret: process.env.JWT_SECRET,
      },
    );

    const newRefresh = this.jwt.sign(
      { sub: String(user._id), employeeCode: user.employeeCode },
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    await this.sessions.createOrReplaceForEmployee(
      employeeCode,
      newRefresh,
      7,
      session.deviceId,
    );
    return { accessToken, refreshToken: newRefresh };
  }

  async logout(employeeCode: string) {
    await this.sessions.revokeAll(employeeCode);
    await this.deviceSessions.removeAllByEmployeeCode(employeeCode);
    return { message: "Logged out" };
  }
}
