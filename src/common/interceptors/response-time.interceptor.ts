import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    
    return next
      .handle()
      .pipe(
        tap(() => {
          const responseTime = Date.now() - start;
          const response = context.switchToHttp().getResponse();
          response.setHeader('X-Response-Time', `${responseTime}ms`);
        })
      );
  }
}