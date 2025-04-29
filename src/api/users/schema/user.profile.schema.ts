import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class UserProfile {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: String })
  empName: string;

  @Prop({ type: String })
  empCode: string;
  
  @Prop({ type: SchemaTypes.ObjectId })
  designationId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId })
  departmentId: Types.ObjectId;

  @Prop({ type: String })
  extNo: string;

  @Prop({ type: SchemaTypes.ObjectId })
  imageId: Types.ObjectId;

  @Prop({ type: Date })
  joiningDate?: Date;
  
  @Prop({ type: Date })
  resignationDate?: Date;

  @Prop({ type: SchemaTypes.ObjectId })
  officeLocationId: Types.ObjectId;
  
  @Prop({ type: SchemaTypes.ObjectId })
  supervisorId: Types.ObjectId;

  @Prop({ unique: true })
  email: string;

  @Prop({ unique: true })
  phone: string;

  @Prop({ type: String })
  role: string;

  @Prop({ type: Boolean, default: false })
  isPublish: boolean;

  @Prop({ type: Boolean, default: false })
  isDelete: boolean;

  @Prop({ type: Boolean, default: false })
  isResign: boolean;

  @Prop({ type: Date })
  publishAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  publishBy?: Types.ObjectId;

  @Prop({ type: Date })
  unPublishedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  unPublishedBy?: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
