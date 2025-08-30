import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { rateLimitStore } from "../rate-limit/rate-limit.store";

@Injectable()
export class LoginAttemptGuard implements CanActivate {
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip;
    const key = `login-attempt-${ip}`;

    const entry = rateLimitStore.unauthenticated.get(key) || {
      timestamps: [],
      blockedUntil: 0,
    };

    const now = Date.now();

    // Check if IP is blocked
    if (entry.blockedUntil > now) {
      const remainingTime = Math.ceil((entry.blockedUntil - now) / 1000 / 60);
      throw new HttpException(
        `Too many login attempts. Try again in ${remainingTime} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Clean old attempts
    entry.timestamps = entry.timestamps.filter(
      (timestamp) => now - timestamp < this.BLOCK_DURATION,
    );

    // Check if limit exceeded
    if (entry.timestamps.length >= this.MAX_ATTEMPTS) {
      entry.blockedUntil = now + this.BLOCK_DURATION;
      rateLimitStore.unauthenticated.set(key, entry);
      throw new HttpException(
        "Too many login attempts. Please try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Record this attempt
    entry.timestamps.push(now);
    rateLimitStore.unauthenticated.set(key, entry);

    return true;
  }
}
