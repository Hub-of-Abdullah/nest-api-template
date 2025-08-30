import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { PermissionRequestDto } from "./dto/create-permission.dto";
import { RolePermission } from "../permission/schema/role-permission.schema";

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(RolePermission.name)
    private readonly rolePermission: Model<RolePermission>,
  ) {}

  async createPermission(data: PermissionRequestDto, currentUserId: object) {
    const existingPermission = await this.rolePermission.findOne({
      permissionKey: data.permissionKey,
      userId: data.userId,
    });
    if (existingPermission) {
      throw new NotFoundException("Permission already exists");
    }
    await new this.rolePermission({
      ...data,
      createdBy: currentUserId,
      createdAt: new Date(),
      isPublished: true,
    }).save();
  }

  async getPermissions() {
    return this.rolePermission.find({}).exec();
  }

  async getPermissionsByUserId(query: FilterQuery<RolePermission>) {
    return this.rolePermission.find(query).exec();
  }

  async updatePermission(
    query: FilterQuery<RolePermission>,
    data: UpdateQuery<RolePermission>,
    currentUserId: object,
  ) {
    const existingPermission = await this.rolePermission.findOne(query);
    if (!existingPermission) {
      throw new NotFoundException("Permission not found");
    }
    const updatePayload: UpdateQuery<RolePermission> = {
      $set: {
        ...data,
        updatedAt: new Date(),
        updatedBy: currentUserId,
      },
    };
    return this.rolePermission.findOneAndUpdate(query, updatePayload, {
      new: true,
    });
  }

  async deletePermission(
    query: FilterQuery<RolePermission>,
    currentUserId: object,
  ) {
    const existingPermission = await this.rolePermission.findOne(query);
    if (!existingPermission) {
      throw new NotFoundException("Permission not found");
    }
    const updatePayload: UpdateQuery<RolePermission> = {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: currentUserId,
      },
    };
    return this.rolePermission.findOneAndUpdate(query, updatePayload, {
      new: true,
    });
  }

  async hasPermission(userId: string, permissionKey: string): Promise<boolean> {
    const existingPermission = await this.rolePermission.findOne({
      userId,
      permissionKey,
      isPublished: true,
      isDeleted: false,
    });
    return !!existingPermission;
  }

  // async deletePermission(id: string, currentUserId: object ) {
  //   const existingPermission = await this.rolePermission.findOne({ _id: id });
  //   if (!existingPermission) {
  //     throw new NotFoundException('Permission not found');
  //   }
  //   const deletePermission = await this.rolePermission.findOneAndUpdate(
  //     { _id: id },
  //     { $set: { isDelete: true, deletedAt: new Date(), deletedBy: currentUserId } },
  //     { new: true },
  //   );
  //   return deletePermission;

  // }

  //  async updatePermission(id: string, permissionRequestDto: PermissionRequestDto, currentUserId: object) {
  //       const existingPermission = await this.rolePermission.findOne({ _id: id,isPublished: true, isDeleted :false});
  //     if (!existingPermission) {
  //       throw new NotFoundException('Permission not found');
  //     }
  //     const updatedPermission = await this.rolePermission.findOneAndUpdate(
  //       { _id: id },
  //       { $set: permissionRequestDto, updatedAt: new Date(), updatedBy: currentUserId },
  //       { new: true },
  //     );
  //     return updatedPermission;
  //   }

  getPermissionById(id: string) {
    return `This action returns a #${id} permission`;
  }
}
