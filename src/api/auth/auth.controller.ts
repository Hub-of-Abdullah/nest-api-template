import { Controller, Post, Res, UseGuards, Body, Req } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { CurrentUser } from "../../decorators/current-user.decorator";
import { User } from "../users/schema/user.schema";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";
import { ApiAuth, ApiPublic } from "src/decorators/http.decorators";
import { LoginResDto } from "./dto/login.res.dto";
import { LoginReqDto, OTPDto } from "./dto/login.req.dto";
import { RateLimitGuard } from "src/common/guards/rate-limit.guard";
import { RateLimit } from "src/common/decorators/rate-limit.decorator";
import { Request } from "express";
import { OtpAuthGuard } from "./guards/otp-auth.guard";
import { JwtWithRefreshAuthGuard } from "./guards/jwt-with-refresh-auth.guard";
// @Controller('auth')

@ApiTags("Authentication")
@Controller({
  path: "auth",
  version: "1",
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiPublic({
    type: LoginReqDto,
    summary: "Sign in with phone number and password",
  })
  @Post("employee/login")
  @UseGuards(RateLimitGuard, LocalAuthGuard)
  @RateLimit({ windowMs: 60_000, deviceLimit: 2 })
  async login(
    @Body() userLogin: LoginReqDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResDto> {
    return await this.authService.login(userLogin, response);
  }

  @ApiPublic({
    type: OTPDto,
    summary: "Sign in with phone number and password",
  })
  @Post("verify/otp")
  @UseGuards(RateLimitGuard, OtpAuthGuard)
  @RateLimit({ windowMs: 60_000, deviceLimit: 50 })
  async verifyOtp(
    @Body() otpDto: OTPDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<any> {
    const tempToken = req.cookies["otp_token"];
    return await this.authService.verifyOtp(otpDto, tempToken, res);
  }


  @ApiAuth({summary: 'Logout'})
  @Post('logout')
  @UseGuards(JwtWithRefreshAuthGuard, RateLimitGuard)
  @RateLimit({ windowMs: 30_000, deviceLimit: 10 })
  async logout(@CurrentUser() user: User, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(user, response);
  }
  
}
