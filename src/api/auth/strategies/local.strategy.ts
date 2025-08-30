import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(private authService: AuthService) {
    super({ usernameField: "employeeCode", passReqToCallback: false });
  }

  async validate(employeeCode: string) {
    console.log("employeeCode", employeeCode);
    const user = await this.authService.validateEmployeeCode(employeeCode);
    if (!user) throw new UnauthorizedException("Invalid employee code");
    return user;
  }
}
