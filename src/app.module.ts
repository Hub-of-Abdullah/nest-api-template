import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { PermissionModule } from './api/permission/permission.module';
import { PermissionModule } from './api/permission/permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true , envFilePath: '.env'}),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        //uri: 'mongodb://127.0.0.1:27017/temp-api',
       uri: configService.getOrThrow('MONGODB_URL'),
       //uri: configService.getOrThrow<string>('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PermissionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
