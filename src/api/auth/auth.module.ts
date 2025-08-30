import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "src/api/users/users.module";
import { DeviceSessionsModule } from "src/api/device-sessions/device-sessions.module";
import { OtpModule } from "src/api/otp/otp.module";
import { SessionsModule } from "src/api/sessions/sessions.module";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshTokenStrategy } from "./strategies/refresh.strategy";

@Module({
  imports: [
    UsersModule,
    DeviceSessionsModule,
    OtpModule,
    SessionsModule,
    JwtModule.register({}), // we pass secrets at sign() time
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
