// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { Request } from 'express';
// import { JwtService } from '@nestjs/jwt';
// import { TokenPayload } from '../token-payload.interface';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class JwtWithRefreshStrategy extends PassportStrategy(Strategy, 'jwt-with-refresh') {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly authService: AuthService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (request: Request) => {
//           return request?.cookies?.Authentication;
//         },
//       ]),
//       secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
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
