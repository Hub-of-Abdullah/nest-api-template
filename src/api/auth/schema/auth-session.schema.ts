import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  employeeCode: string;

  @Prop({ type: String, required: true }) // hash refresh token if desired
  refreshToken: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: String })
  deviceId?: string;
}
export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ employeeCode: 1, deviceId: 1 }, { unique: false });
SessionSchema.index({ expiresAt: 1 }); // <-- This also adds an index
