// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { Request } from 'express';
// import { TokenPayload } from '../token-payload.interface';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
//   constructor(private readonly authService: AuthService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (request: Request) => {
//           return request?.cookies?.Refresh;
//         },
//       ]),
//       secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
//       passReqToCallback: true,
//     });
//   }

//   async validate(request: Request, payload: TokenPayload) {
//     const user = await this.authService.verifyUserRefreshToken(
//       request.cookies?.Refresh,
//       payload.userId,
//     );

//     if (!user) {
//       throw new UnauthorizedException();
//     }

//     return user;
//   }
// }
