import { EmailField, PasswordField, PhoneField } from '../../../decorators/field.decorators';

export class CreateUserWithEmailRequest {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;
}

export class CreateUserWithPhoneRequest {
  @PhoneField()
  phoneNumber!: string;

  @PasswordField()
  password!: string;
}
