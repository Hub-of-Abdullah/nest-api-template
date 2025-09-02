import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
  Logger,
} from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { setupSwagger } from "./utils/setup-swagger";
import { Environment } from "./constants/app.constant";
import * as compression from "compression";
import helmet from "helmet";
import { ValidationError } from "class-validator";
import { appConfig } from "src/config/config";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { ResponseTimeInterceptor } from "./common/interceptors/response-time.interceptor";

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    bufferLogs: false,
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Global response time interceptor
  app.useGlobalInterceptors(new ResponseTimeInterceptor());

  // Setup security headers
  app.use(helmet());
  
  // Compression middleware
  app.use(compression());
  
  // Enable cookie parser middleware
  app.use(cookieParser());

  // const configService = app.get(ConfigService);
  const isProduction = appConfig.server.nodeEnv === Environment.PRODUCTION;
  const corsOrigins = appConfig.client.corsOrigins;
  const port = appConfig.server.port;

  // Enable CORS with specified origins
  app.enableCors({
    origin: corsOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Accept",
    credentials: true,
  });

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
  
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  if (!isProduction) {
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  }
  logger.log(`🌍 Environment: ${appConfig.server.nodeEnv}`);
}
bootstrap();
