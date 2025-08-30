import {
  IsEmail,
  IsString,
  IsPhoneNumber,
} from "class-validator";

export class CreateUserRequest {
  @IsEmail()
  email: string;

  // @IsStrongPassword()
  @IsString()
  password: string;
}

export class CreateUserWithPhoneRequest {
  @IsPhoneNumber()
  phoneNumber: string;

  // @IsStrongPassword()
  @IsString()
  password: string;
}
