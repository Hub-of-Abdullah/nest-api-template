import { EmailField, PasswordField, PhoneField } from '../../../decorators/field.decorators';

export class LoginReqWithEmailDto {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;
}

export class LoginReqWithPhoneDto {
  @PhoneField()
  phoneNumber!: string;

  @PasswordField()
  password!: string;
}

export class LoginDto {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;
}