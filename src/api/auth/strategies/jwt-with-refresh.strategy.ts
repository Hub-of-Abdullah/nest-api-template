import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request, Response } from "express";
import { TokenPayload } from "../token-payload.interface";
import { AuthService } from "../auth.service";
import { UsersService } from "../../users/users.service";
import { appConfig } from "src/config/config";
@Injectable()
export class JwtWithRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-with-refresh",
) {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    // ← make sure you inject JwtService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.accessToken,
      ]),
      secretOrKey: appConfig.jwt.accessSecret,
      passReqToCallback: true,
      ignoreExpiration: true, // so you can catch expired tokens yourself
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const response = (request as any).res as Response;

    const refreshTokenFromCookie = request.cookies?.refreshToken;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      if (!refreshTokenFromCookie) {
        throw new UnauthorizedException("Refresh token not found in cookies");
      }
      let refreshPayload: TokenPayload;

      try {
        refreshPayload = this.jwtService.verify<TokenPayload>(
          refreshTokenFromCookie,
          {
            secret: appConfig.jwt.refreshSecret,
          },
        );
      } catch {
        throw new UnauthorizedException("Invalid refresh token");
      }
      if (refreshPayload.exp < now) {
        throw new UnauthorizedException("Refresh token expired");
      }
      const isValidRefreshToken = await this.authService.verifyUserSession(
        refreshTokenFromCookie,
        refreshPayload.employeeCode,
      );

      if (!isValidRefreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // generate new tokens…
      const newAccess = await this.authService.generateToken1(
        refreshPayload,
        appConfig.jwt.accessExpiresIn,
        appConfig.jwt.accessSecret,
      );
      const newRefresh = await this.authService.generateToken1(
        refreshPayload,
        appConfig.jwt.refreshExpiresIn,
        appConfig.jwt.refreshSecret,
      );

      await this.authService.createOrReplaceSession(
        payload.employeeCode,
        newRefresh,
        appConfig.jwt.refreshExpiresIn,
      );

      // set fresh cookies on the real Response
      this.authService.setTokenInCookies(newAccess, newRefresh, response);

      return this.usersService.getUser({ employeeCode: payload.employeeCode });
    }
    // token still valid
    return this.usersService.getUser({ employeeCode: payload.employeeCode });
  }
}
