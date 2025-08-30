import { plainToClass } from "class-transformer";
import { IsString, IsNumber, IsOptional, validateSync } from "class-validator";

class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  NODE_ENV: string;

  @IsString()
  MONGODB_URL: string;

  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsNumber()
  JWT_ACCESS_TOKEN_EXPIRATION_MS: number;

  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsNumber()
  JWT_REFRESH_TOKEN_EXPIRATION_MS: number;

  @IsString()
  APP_CORS_ORIGIN: string;

  @IsOptional()
  @IsNumber()
  RATE_LIMIT_TTL?: number;

  @IsOptional()
  @IsNumber()
  RATE_LIMIT_LIMIT?: number;

  @IsOptional()
  @IsNumber()
  BCRYPT_ROUNDS?: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
