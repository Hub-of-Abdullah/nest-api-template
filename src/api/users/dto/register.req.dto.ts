import {
  EmailField,
  PasswordField,
  PhoneField,
} from "../../../decorators/field.decorators";

export class RegisterReqDto {
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
