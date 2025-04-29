import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class RolePermission {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;
  
  @Prop({ required: true })
  resource: string;

  @Prop({required: true})
  action : string;

  @Prop({ type: Boolean, default: false })
  isPublish: boolean;

  @Prop({ type: Boolean, default: false })
  isDelete: boolean;

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
export const RolePermissionSchema = SchemaFactory.createForClass(RolePermission);






   