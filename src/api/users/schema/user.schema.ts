import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class User {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ unique: true })
  email: string;
  
  @Prop({ unique: true })
  phone: string;

  @Prop({select: false})
  refreshToken?: string;

  @Prop({select: false})
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
