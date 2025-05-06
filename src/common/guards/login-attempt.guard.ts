import {
    CanActivate,
    ExecutionContext,
    Injectable,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { rateLimitStore } from '../rate-limit/rate-limit.store';
  
  @Injectable()
  export class LoginAttemptGuard implements CanActivate {
    private MAX_ATTEMPTS = 5;
    private WINDOW = 60 * 1000; // 1 minute
   // private BLOCK_TIME = 10 * 60 * 1000; // 10 minutes
   private BLOCK_TIME = 1 * 60 * 1000; // 1 minutes

    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<Request>();
      const ip = request.ip;
      const now = Date.now();

      console.log('ip', ip);
        
      const entry = rateLimitStore.unauthenticated.get(ip) || { timestamps: [] };
  
      // Check if IP is blocked
      if (entry.blockedUntil && now < entry.blockedUntil) {
        throw new HttpException(
          'Too many login attempts. Try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
  
      // Filter out old timestamps
      const recent = entry.timestamps.filter((t) => now - t < this.WINDOW);
  
      // Check if max attempts exceeded
      if (recent.length >= this.MAX_ATTEMPTS) {
        rateLimitStore.unauthenticated.set(ip, {
          timestamps: [],
          blockedUntil: now + this.BLOCK_TIME,
        });
        throw new HttpException(
          'Too many login attempts. Try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
  
      // Save current timestamp
      recent.push(now);
      rateLimitStore.unauthenticated.set(ip, { timestamps: recent });
  
      return true;
    }
  }
  