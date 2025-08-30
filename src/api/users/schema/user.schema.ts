import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema({ timestamps: true })
export class User {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true }) // Index for search by name
  name: string;

  @Prop({ type: String, unique: true, required: true, index: true }) // Unique + Indexed
  employeeCode: string;

  @Prop({ type: String, unique: true, required: true, index: true }) // Unique + Indexed
  phone: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: "Team",
    required: true,
    index: true,
  }) // Indexed for filtering by team
  teamId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: "Territory",
    required: true,
    index: true,
  }) // Indexed for filtering by territory
  territoryId: Types.ObjectId;

  @Prop({ type: String, required: true, index: true }) // Indexed for role-based queries
  role: string;

  @Prop({ type: Boolean, default: false, index: true }) // Indexed for filtering published users
  isPublish?: boolean;

  @Prop({ type: Boolean, default: false, index: true }) // Indexed for soft delete
  isDelete?: boolean;

  @Prop({ type: Boolean, default: false })
  isResign?: boolean;

  @Prop({ type: Date, index: true }) // Indexed for date-based queries
  publishAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  publishBy?: Types.ObjectId;

  @Prop({ type: Date })
  unPublishedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  unPublishedBy?: Types.ObjectId;

  @Prop({ type: Date, index: true }) // Indexed for deletion history
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  deletedBy?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ employeeCode: 1, teamId: 1 }); // Search by employee within a team
UserSchema.index({ phone: 1, territoryId: 1 }); // Search by phone within a territory
UserSchema.index({ role: 1, isDelete: 1 }); // Filter users by role & active status
UserSchema.index({ isPublish: 1, publishAt: -1 }); // Get published users sorted by latest
