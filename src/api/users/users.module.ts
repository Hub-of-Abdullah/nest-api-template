// import { Module } from '@nestjs/common';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { MongooseModule } from '@nestjs/mongoose';
// import { User, UserSchema } from './schema/user.schema';

// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       {
//         name: User.name,
//         schema: UserSchema,
//       },
//     ]),
//   ],
//   controllers: [UsersController],
//   providers: [UsersService],
//   exports: [UsersService],
// })
// export class UsersModule {}

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/user.schema";
import { UsersService } from "./users.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
