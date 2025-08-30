// import { StringField } from '../../../decorators/field.decorators';
// import { IsNumber } from 'class-validator';

// export class LoginReqDto {
//   @StringField()
//   employeeCode!: string;
// }

// export class OTPDto {
//   @StringField( { nullable: false , maxLength: 6, minLength: 6} )
//   otpCode!: string;
// }

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class LoginReqDto {
  @ApiProperty({
    example: "EMP-0001",
    description: "Unique employee code assigned to the user",
  })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({
    example: "d3v1c3-1d-987654321",
    description: "Unique identifier for the user’s device",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    example: "203.76.123.15",
    description: "IP address of the user device",
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    example:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/116.0.0.0 Safari/537.36",
    description: "User agent string of the browser or device",
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    example: '{"canvas":"af12be34","webgl":"cd56ef78"}',
    description: "Browser fingerprint data for device verification",
    required: false,
  })
  @IsOptional()
  browserFingerprint?: any;
}

export class OTPDto {
  @ApiProperty({
    example: "654321",
    description: "One-time password sent to the user for verification",
  })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    example: "d3v1c3-1d-987654321",
    description: "Same device identifier used in login request",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    example: "203.76.123.15",
    description: "IP address of the user device",
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    example:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/116.0.0.0 Safari/537.36",
    description: "User agent string of the browser or device",
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    example: '{"canvas":"af12be34","webgl":"cd56ef78"}',
    description: "Browser fingerprint data for device verification",
    required: false,
  })
  @IsOptional()
  browserFingerprint?: any;
}
