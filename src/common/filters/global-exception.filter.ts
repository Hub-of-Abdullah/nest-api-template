import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorDto } from '../dto/error.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any)?.message || exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      
      // Log unexpected errors
      this.logger.error('Unexpected error:', exception);
    }

    const errorResponse: ErrorDto = {
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: HttpStatus[status] || 'Unknown Error',
      message: Array.isArray(message) ? message.join(', ') : message,
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}