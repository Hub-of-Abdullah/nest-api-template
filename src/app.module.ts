import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "./api/users/users.module";
import { AuthModule } from "./api/auth/auth.module";
import { SeederModule } from "./api/seeder/seeder.module";
import { CommonModule } from "./common/common.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow("MONGODB_URL"),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    CommonModule,
    UsersModule,
    AuthModule,
    SeederModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
