import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class RolePermission {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  userId: string;
  
  @Prop({ required: true })
  resource: string;

  @Prop({required: true})
  action : string;

}
export const RolePermissionSchema = SchemaFactory.createForClass(RolePermission);
