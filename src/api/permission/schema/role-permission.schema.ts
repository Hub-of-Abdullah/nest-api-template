import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types, Document } from "mongoose";

export type RolePermissionDocument = RolePermission & Document;

@Schema()
export class RolePermission {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId: Types.ObjectId;

  // @Prop({ type: SchemaTypes.ObjectId, required: true})
  // permissonKeyId: Types.ObjectId; // Note: Typo in field name ("permisson")

  @Prop({ required: true })
  permissionKey: string; // Note: Typo in field name ("permisson")

  @Prop({ type: Boolean, default: false })
  isPublished: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId })
  publishedBy?: Types.ObjectId;

  @Prop({ type: Date })
  unPublishedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId })
  unPublishedBy?: Types.ObjectId;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId })
  deletedBy?: Types.ObjectId;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId })
  createdBy?: Types.ObjectId;
}

export const RolePermissionSchema =
  SchemaFactory.createForClass(RolePermission);

// Unique composite index to prevent duplicates
//RolePermissionSchema.index({ userId: 1, permissonKeyId: 1 }, { unique: true });

// Indexes for common query patterns//
RolePermissionSchema.index({ permissonKey: 1 }); // Existing index
//RolePermissionSchema.index({ permissonKeyId: 1 }); // New: Lookup by key ID
RolePermissionSchema.index({ userId: 1, isPublish: 1, isDelete: 1 }); // New: User's active permissions
RolePermissionSchema.index({ publishAt: -1 }); // New: Sort by recent publishes
RolePermissionSchema.index({ isDelete: 1 }); // New: Filter deleted docs
