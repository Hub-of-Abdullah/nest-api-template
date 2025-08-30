import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  DeviceSession,
  DeviceSessionSchema,
} from "./schema/device-session.schema";
import { DeviceSessionsService } from "./device-sessions.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceSession.name, schema: DeviceSessionSchema },
    ]),
  ],
  providers: [DeviceSessionsService],
  exports: [DeviceSessionsService],
})
export class DeviceSessionsModule {}
