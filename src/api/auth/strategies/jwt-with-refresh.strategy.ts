// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { Request, Response } from 'express';
// import { verify } from 'jsonwebtoken';
// import { TokenPayload } from '../token-payload.interface';
// import { AuthService } from '../auth.service';
// import { UsersService } from '../../users/users.service';
//new
// @Injectable()
// export class JwtWithRefreshStrategy extends PassportStrategy(Strategy,'jwt-with-refresh',) {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly authService: AuthService,
//     private readonly usersService: UsersService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (request: Request) => request.cookies?.Authentication,
//       ]),
//       secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
//       passReqToCallback: true,
//       ignoreExpiration: true,

//     });
//   }

//   async validate(request: Request, payload: TokenPayload, response: Response) {
//     console.log('JwtWithRefreshStrategy validate called: ', payload);
//     // Check if access token is expired

//     const currentTime = Math.floor(Date.now() / 1000);
//     const isAccessTokenExpired = payload.exp < currentTime;
//     console.log('Access token expired: ', isAccessTokenExpired);
    
//     if (isAccessTokenExpired) {
//         console.log('Access token expired');
//         const refreshToken = request.cookies?.Refresh;
//         console.log('Refresh token: ', refreshToken);

//         if (!refreshToken) {
//             throw new UnauthorizedException('Expired access token and no refresh token provided');
//         //   throw new UnauthorizedException();
//         }

//         let refreshTokenPayload: TokenPayload;
//         console.log('JWT_REFRESH_TOKEN_SECRET: ', this.configService.get('JWT_REFRESH_TOKEN_SECRET'));
       
//         console.log("refreshTokenPayload", refreshTokenPayload);
//         try {
//           // Verify refresh token using its secret
//           refreshTokenPayload = verify(refreshToken,
//             this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
//           ) as TokenPayload;
//         } catch (error) {
//           throw new UnauthorizedException('Invalid refresh token1');
//         }



//         if (refreshTokenPayload.exp < currentTime) {
//             throw new UnauthorizedException('Refresh token expired2');
//           }

//         const isRefreshTokenValid = await this.authService.verifyUserRefreshToken(
//             refreshToken,
//             payload.userId,
//         );
//         if (!isRefreshTokenValid) {
//             throw new UnauthorizedException('Invalid refresh token3');
//         }
//         // Generate new tokens
//         const newAccessToken = await this.authService.generateAccessToken(payload.userId);
//         const newRefreshToken = await this.authService.generateRefreshToken(payload.userId);
//         await this.authService.updateRefreshToken(payload.userId, newRefreshToken);
//         // Set new refresh token in cookies
//         await this.authService.setToken(newAccessToken, newRefreshToken, response)

//         // request.cookies.Refresh = newRefreshToken;
//         // request.cookies.Authentication = newAccessToken;

//         return this.usersService.getUser({ _id: payload.userId });
//       }
//       return this.usersService.getUser({ _id: payload.userId });
    
//   }
// }


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
      console.log('Refresh token: ', rawRefreshToken);
      console.log('JWT_REFRESH_TOKEN_SECRET: ', this.configService.get('JWT_REFRESH_TOKEN_SECRET'));
      
      //Verify signature
      let refreshPayload: TokenPayload;
      try {
         refreshPayload = this.jwtService.verify<TokenPayload>(rawRefreshToken, {
          secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        });
        console.log('refreshPayload', refreshPayload);
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
