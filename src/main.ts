import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { setupSwagger } from "./utils/setup-swagger";
import config from "./config/config";
import { Environment } from "./constants/app.constant";
import * as compression from "compression";
import helmet from "helmet";
import { ValidationError } from "class-validator";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Setup security headers
  app.use(helmet());

  // Compression middleware
  app.use(compression());

  // Enable cookie parser middleware
  app.use(cookieParser());

  const appConfig = config();
  const isProduction = appConfig.server.nodeEnv === Environment.PRODUCTION;
  const corsOrigins = appConfig.client.corsOrigins;
  const port = appConfig.server.port;

  // Enable CORS with specified origins
  app.enableCors({
    origin: corsOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Accept, Authorization",
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Use global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(errors);
      },
    }),
  );

  // Setup Swagger documentation for non-production environments
  if (!isProduction) {
    setupSwagger(app);
  }

  // Enables shutdown hooks
  app.enableShutdownHooks();

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
}

bootstrap();
