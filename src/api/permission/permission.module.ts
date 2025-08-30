import { Module } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { PermissionController } from "./permission.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  RolePermission,
  RolePermissionSchema,
} from "../permission/schema/role-permission.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RolePermission.name,
        schema: RolePermissionSchema,
      },
    ]),
  ],

  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
