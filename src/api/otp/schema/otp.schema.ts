import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema({ timestamps: true })
export class Otp {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  employeeCode: string;

  @Prop({ type: String, required: true, index: true })
  token: string;

  @Prop({ type: String, required: true })
  otp: string;

  @Prop({ type: Date, required: true }) // expire at
  expiresAt: Date;
}
export const OtpSchema = SchemaFactory.createForClass(Otp);
// TTL index by expiresAt (Mongo will auto-delete after expiry)
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
