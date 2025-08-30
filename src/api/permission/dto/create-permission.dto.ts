import { StringField } from "../../../decorators/field.decorators";
export class PermissionRequestDto {
  @StringField()
  userId: string;

  @StringField()
  permissionKey: string;
}
