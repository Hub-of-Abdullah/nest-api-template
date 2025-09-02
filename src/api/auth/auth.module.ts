import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtWithRefreshStrategy } from "./strategies/jwt-with-refresh.strategy";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/schema/user.schema";
import { Session, SessionSchema } from "./schema/auth-session.schema";
import { OtpStrategy } from "./strategies/otp.strategy";
import { OtpModule } from "../otp/otp.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    UsersModule,
    PassportModule.register({ session: false }), // Important
    JwtModule.register({}),
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtWithRefreshStrategy, OtpStrategy],
  exports: [AuthService],
})
export class AuthModule {}
