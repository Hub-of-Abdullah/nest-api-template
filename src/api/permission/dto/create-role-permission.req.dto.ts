import { StringField } from '../../../decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RolePermissionReqDto {
  @Expose()
  @StringField()
  userId: string;

  @Expose()
  @StringField()
  resource: string;

  @Expose()
  @StringField()
  action: string;
}
