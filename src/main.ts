import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './utils/setup-swagger';
import config from './config/config';
import { Environment } from './constants/app.constant';
import * as compression from 'compression';
import helmet from 'helmet';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule, {
  //   cors: true,        // Allow cross-origin requests from any domain
  //   bufferLogs: false, // Show logs immediately during startup
  // });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Show logs immediately during startup
  });

  // Setup security headers
  app.use(helmet());
  // For high-traffic websites in production, it is strongly recommended to offload compression from the application server - typically in a reverse proxy (e.g., Nginx). In that case, you should not use compression middleware.
  app.use(compression());
  // Enable cookie parser middleware
  app.use(cookieParser());

  // const configService = app.get(ConfigService);
  const appConfig = config();
  const isProduction = appConfig.server.nodeEnv === Environment.PRODUCTION;
  const corsOrigins = appConfig.client.corsOrigins;
  const port = appConfig.server.port;

  // Enable CORS with specified origins
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  // Use global pipes for validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    exceptionFactory: (errors: ValidationError[]) => {
      return new UnprocessableEntityException(errors);
    },
  })
  );

  // Setup Swagger documentation for non-production environments
  if (!isProduction) {
    setupSwagger(app);
  }
  await app.listen(port);

}
bootstrap();
