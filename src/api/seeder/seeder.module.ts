import { Module } from "@nestjs/common";
import { SeederService } from "./seeder.service";
import { SeederController } from "./seeder.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/schema/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
