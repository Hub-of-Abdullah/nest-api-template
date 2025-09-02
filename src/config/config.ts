import { config } from "dotenv";
import { Environment, DefaultUrl } from "../constants/app.constant";

config(); // Loads .env variables into process.env

// Validate required environment variables
const requiredEnvVars = [
  "JWT_SECRET",
  "JWT_ACCESS_TOKEN_SECRET",
  "JWT_REFRESH_TOKEN_SECRET",
  "MONGODB_URL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const appConfig = {
  jwt: {
    otpSecret: process.env.JWT_SECRET!,
    accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET!,
    accessExpiresIn: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS || "900000",
      10,
    ), // 15 min
    refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET!,
    refreshExpiresIn: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS || "604800000",
      10,
    ), // 7 days
    cookieExpiresIn: parseInt(
      process.env.COOKIE_EXPIRATION_MS || "604800000",
      10,
    ), // 7 days
  },
  otp: {
    expirationTime: parseInt(process.env.OTP_EXPIRATION_MS || "300000", 10), // 5 min
    tokenExpirationTime: parseInt(
      process.env.OTP_TOOKEN_EXPIRATION_MS || "300000",
      10,
    ), // 5 min
  },
  database: {
    connectionString: process.env.MONGODB_URL!,
  },
  server: {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || Environment.DEVELOPMENT,
  },
  client: {
    corsOrigins: process.env.APP_CORS_ORIGIN
      ? process.env.APP_CORS_ORIGIN.split(",")
      : [DefaultUrl.APP_CORS_ORIGIN],
  },
};
