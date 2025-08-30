// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy , 'otp-token') {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([(req: any) => req?.cookies?.otp_token]),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET,
//     });
//   }

//   async validate(payload: any) {

//     return { sub: payload.sub, employeeCode: payload.employeeCode, role: payload.role };
//   }

// }

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { TokenPayload } from "../token-payload.interface";

@Injectable()
export class OtpTokenStrategy extends PassportStrategy(Strategy, "otp_token") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.otp_token;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    console.log(payload);
    return {
      sub: payload.sub,
      employeeCode: payload.employeeCode,
      role: payload.role,
    };
  }
}
