import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema({ timestamps: true })
export class AuthSession {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  employeeCode: string;

  @Prop({ type: String, required: true }) // hash refresh token if desired
  refreshToken: string;

  @Prop({ type: Date, required: true, index: true })
  expiresAt: Date;

  @Prop({ type: String })
  deviceId?: string;
}
export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
AuthSessionSchema.index({ employeeCode: 1, deviceId: 1 }, { unique: false });
AuthSessionSchema.index({ expiresAt: 1 }); // <-- This also adds an index
