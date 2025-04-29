import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request, Response } from 'express';
import { TokenPayload } from '../token-payload.interface';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
@Injectable()
export class JwtWithRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-with-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,      // ← make sure you inject JwtService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.Authentication,
      ]),
      secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: true,  // so you can catch expired tokens yourself
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const response = (request as any).res as Response;

    console.log('JwtWithRefreshStrategy validate called: ', payload);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {

      //Pull the raw token
      const rawRefreshToken = request.cookies?.Refresh;

      if (!rawRefreshToken) {
        throw new UnauthorizedException('No refresh token');
      }
 
      //Verify signature
      let refreshPayload: TokenPayload;
      try {
         refreshPayload = this.jwtService.verify<TokenPayload>(rawRefreshToken, {
          secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        });
      } catch (error) {
        throw new UnauthorizedException('Invalid refresh token1');
      }

      if (refreshPayload.exp < now) {
        throw new UnauthorizedException('Refresh token expired2');
      }
      // Compare raw ⇄ hash in DB
      await this.authService.verifyUserRefreshToken(rawRefreshToken, refreshPayload.userId);


      // generate new tokens…
      const newAccess  = await this.authService.generateAccessToken(payload.userId);
      const newRefresh = await this.authService.generateRefreshToken(payload.userId);
      await this.authService.updateRefreshToken(payload.userId, newRefresh);


      this.authService.setToken(newAccess, newRefresh, response);


      // set fresh cookies on the real Response
      await this.authService.setToken(newAccess, newRefresh, response);

      return this.usersService.getUser({ _id: payload.userId });
    }
    // token still valid
    return this.usersService.getUser({ _id: payload.userId });
  }
}
