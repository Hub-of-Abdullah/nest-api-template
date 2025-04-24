import { Environment, DefaultUrl } from '../constants/app.constant';

export default () => ({
    jwt: {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET, // JWT secret for signing tokens
      accessExpirationTime: process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS, // JWT access token expiration time
      refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET, // JWT secret for signing refresh tokens
      refreshExpirationTime: process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS, // JWT refresh token expiration time
    },
    database: {
      connectionString: process.env.MONGODB_URL, // MongoDB connection string
    },
    server: {
      port: process.env.PORT , // Server port, default to 4000 if not defined
      nodeEnv: process.env.NODE_ENV || Environment.DEVELOPMENT, // Node environment
    },
    client: {
      corsOrigins: process.env.APP_CORS_ORIGIN 
        ? process.env.APP_CORS_ORIGIN.split(',') 
        : [DefaultUrl.APP_CORS_ORIGIN], 
    },
  });


  // export default () => {
  //   const isValidUrl = (url) => {
  //     // Basic URL pattern matcher
  //     const urlPattern = /^(https?:\/\/)([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
  //     if (!urlPattern.test(url)) {
  //       console.warn(`URL does not match expected pattern: ${url}`);
  //       return false;
  //     }
  
  //     try {
  //       new URL(url); // Additional validation with the URL constructor
  //       return true;
  //     } catch {
  //       console.warn(`Invalid URL format: ${url}`);
  //       return false;
  //     }
  //   };
  
  //   const parseCorsOrigins = (origins) => {
  //     if (!origins) {
  //       return ['http://localhost:3000']; // Default to localhost:3000
  //     }
  
  //     return origins
  //       .split(',')
  //       .map((url) => url.trim())
  //       .filter((url) => isValidUrl(url));
  //   };
  
  //   return {
  //     jwt: {
  //       secret: process.env.JWT_ACCESS_TOKEN_SECRET, // JWT secret for signing tokens
  //       accessExpirationTime: process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS, // JWT access token expiration time
  //       refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET, // JWT secret for signing refresh tokens
  //       refreshExpirationTime: process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS, // JWT refresh token expiration time
  //     },
  //     database: {
  //       connectionString: process.env.MONGODB_URL, // MongoDB connection string
  //     },
  //     server: {
  //       port: parseInt(process.env.PORT, 10) || 4000, // Server port, default to 4000 if not defined
  //     },
  //     client: {
  //       corsOrigins: parseCorsOrigins(process.env.CLIENT_URLS), // Validate and parse corsOrigins
  //     },
  //     nodeEnv: process.env.NODE_ENV || 'development', // Node environment
  //   };
  // };
  