import { Environment, DefaultUrl } from "../constants/app.constant";

export default () => ({
  jwt: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    accessExpirationTime: process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS,
    refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refreshExpirationTime: process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS,
  },
  database: {
    connectionString: process.env.MONGODB_URL,
  },
  server: {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV || Environment.DEVELOPMENT,
  },
  client: {
    corsOrigins: process.env.APP_CORS_ORIGIN
      ? process.env.APP_CORS_ORIGIN.split(",")
      : [DefaultUrl.APP_CORS_ORIGIN],
  },
});
