import {
  StringField,
  StringFieldOptional,
} from "src/decorators/field.decorators";

export class LoginReqDto {
  @StringField({
    example: "107777",
    description: "Unique employee code assigned to the user",
  })
  employeeCode!: string;

  @StringField({
    example: "d3v1c3-1d-987654321",
    description: "Unique identifier for the user's device",
  })
  deviceId!: string;

  @StringFieldOptional({
    example: "203.76.123.15",
    description: "IP address of the user device",
  })
  ipAddress?: string;

  @StringFieldOptional({
    example:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/116.0.0.0 Safari/537.36",
    description: "User agent string of the browser or device",
  })
  userAgent?: string;

  @StringFieldOptional({
    example: '{"canvas":"af12be34","webgl":"cd56ef78"}',
    description: "Browser fingerprint data for device verification",
  })
  browserFingerprint?: string;
}

export class OTPDto {
  @StringField({
    example: "654321",
    description: "One-time password sent to the user for verification",
    maximum: 6,
    minimum: 6,
  })
  otp!: string;

  @StringField({
    example: "d3v1c3-1d-987654321",
    description: "Same device identifier used in login request",
  })
  deviceId!: string;

  @StringFieldOptional({
    example: "203.76.123.15",
    description: "IP address of the user device",
  })
  ipAddress?: string;

  @StringFieldOptional({
    example:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/116.0.0.0 Safari/537.36",
    description: "User agent string of the browser or device",
  })
  userAgent?: string;

  @StringFieldOptional({
    example: '{"canvas":"af12be34","webgl":"cd56ef78"}',
    description: "Browser fingerprint data for device verification",
  })
  browserFingerprint?: string;
}
