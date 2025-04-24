import { EmailField, PasswordField, PhoneField } from '../../../decorators/field.decorators';

export class LoginReqWithEmailDto {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;
}

export class LoginReqWithPhoneDto {
  @PhoneField()
  phone!: string;

  @PasswordField()
  password!: string;
}

export class LoginReqDto {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;
}