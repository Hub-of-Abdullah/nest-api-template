import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema({ timestamps: true })
export class DeviceSession {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, index: true }) // employeeCode
  employeeCode: string;

  @Prop({ type: String, required: true, index: true }) // deviceId (from client)
  deviceId: string;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String }) // store JSON string of fingerprint
  browserFingerprint?: string;

  @Prop({ type: Boolean, default: true, index: true })
  active: boolean;
}
export const DeviceSessionSchema = SchemaFactory.createForClass(DeviceSession);
DeviceSessionSchema.index({ employeeCode: 1, deviceId: 1 }, { unique: true });
