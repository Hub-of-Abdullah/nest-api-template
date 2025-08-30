import { PartialType } from "@nestjs/swagger";
import { PermissionRequestDto } from "./create-permission.dto";

export class UpdatePermissionDto extends PartialType(PermissionRequestDto) {}
