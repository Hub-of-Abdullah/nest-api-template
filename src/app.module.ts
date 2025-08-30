import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "./api/users/users.module";
import { AuthModule } from "./api/auth/auth.module";
import { PermissionModule } from "./api/permission/permission.module";
import { HealthModule } from "./health/health.module";
import { SeederModule } from "./api/seeder/seeder.module";
import { validate } from "./config/config.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate,
    }),

    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow("MONGODB_URL"),
        connectionFactory: (connection) => {
          connection.on("connected", () => {
            console.log("✅ MongoDB connected successfully");
          });
          connection.on("error", (error) => {
            console.error("❌ MongoDB connection error:", error);
          });
          connection.on("disconnected", () => {
            console.log("⚠️ MongoDB disconnected");
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PermissionModule,
    HealthModule,
    SeederModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
