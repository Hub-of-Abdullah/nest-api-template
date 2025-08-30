import { Controller, Post, Res, Body, UseGuards, Req } from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";
import { LoginReqDto, OTPDto } from "./dto/login.req.dto";
import { setCookie, clearCookie } from "../../utils/cookies";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RefreshAuthGuard } from "./guards/refresh-auth.guard";
import { RateLimit } from "../../common/decorators/rate-limit.decorator";
import { RateLimitGuard } from "../../common/guards/rate-limit.guard";
import { OtpTokenGuard } from "./guards/otp.token.guard";
import { CurrentUser } from "../../decorators/current-user.decorator";
import { TokenPayload } from "./token-payload.interface";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@ApiTags("Authentication")
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("employee/login")
  @UseGuards(RateLimitGuard, LocalAuthGuard)
  @RateLimit({ windowMs: 60_000, deviceLimit: 50 })
  async loginWithEmployeeCode(@Body() dto: LoginReqDto, @Res() res: Response) {
    const result = await this.auth.loginWithEmployeeCode(dto);

    console.log('result', result);
    // Store temporary token for OTP step (optional cookie; you can also return in body only)
    setCookie(res, "otp_token", result.token, 5 * 60 * 1000);
    return res.json({ message: result.message });
  }

  @Post("verify/otp")
  @UseGuards(RateLimitGuard, OtpTokenGuard)
  @RateLimit({ windowMs: 60_000, deviceLimit: 2 })
  async verifyOtp(
    @CurrentUser() user: TokenPayload,
    @Body() dto: OTPDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const token = req.cookies?.otp_token;
    const { accessToken, refreshToken } = await this.auth.verifyOtp(
      user,
      dto,
      token,
    );

    // Set HTTP-only cookies and remove temp cookie
    clearCookie(res, "otp_token");
    setCookie(res, "access_token", accessToken, 15 * 60 * 1000);
    setCookie(res, "refresh_token", refreshToken, 7 * 24 * 60 * 60 * 1000);

    return res.json({ message: "Authenticated" });
  }

  @Post("refresh")
  @UseGuards(RefreshAuthGuard)
  async refresh(
    @Body("employeeCode") employeeCode: string,
    @Res() res: Response,
  ) {
    // employeeCode in body helps bind server-side session to a principal
    const oldRefresh = (res.req as any)?.cookies?.refresh_token;
    const { accessToken, refreshToken } = await this.auth.rotateTokens(
      employeeCode,
      oldRefresh,
    );
    setCookie(res, "access_token", accessToken, 15 * 60 * 1000);
    setCookie(res, "refresh_token", refreshToken, 7 * 24 * 60 * 60 * 1000);
    return res.json({ message: "Tokens refreshed" });
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(
    @Body("employeeCode") employeeCode: string,
    @Res() res: Response,
  ) {
    await this.auth.logout(employeeCode);
    clearCookie(res, "access_token");
    clearCookie(res, "refresh_token");
    return res.json({ message: "Logged out" });
  }
}
