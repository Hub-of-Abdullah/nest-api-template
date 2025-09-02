import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { rateLimitStore } from "../rate-limit/rate-limit.store";
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from "../decorators/rate-limit.decorator";

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly DEFAULT_WINDOW = 60_000; // 1 minute
  private readonly DEFAULT_USER_LIMIT = 2;
  private readonly DEFAULT_DEVICE_LIMIT = 3;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const ip = req.ip;

    // Identify this route uniquely
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;
    const routeKey = `${className}.${handlerName}`; // e.g. UsersController.getMe

    // Check for method-level decorator overrides
    const methodOpts = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    //  Check for controller-level decorator defaults
    const classOpts = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getClass(),
    );

    // Merge in priority: method > class > global defaults
    const opts: RateLimitOptions = methodOpts ?? classOpts ?? {};

    const windowMs = opts.windowMs ?? this.DEFAULT_WINDOW;
    const userLimit = opts.userLimit ?? this.DEFAULT_USER_LIMIT;
    const deviceLimit = opts.deviceLimit ?? this.DEFAULT_DEVICE_LIMIT;

    if (user && user._id) {
      // Authenticated user logic, keyed by user.id + route
      const key = `user-${user._id}-${routeKey}`;
      const timestamps = rateLimitStore.authenticated.get(key) || [];
      const recent = timestamps.filter((ts) => now - ts < windowMs);

      if (recent.length >= userLimit) {
        throw new HttpException(
          "Rate limit exceeded (user)",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      recent.push(now);
      rateLimitStore.authenticated.set(key, recent);
    } else {
      // Unauthenticated device logic, keyed by IP + route
      const key = `ip-${ip}-${routeKey}`;
      const entry = rateLimitStore.unauthenticated.get(key) || {
        timestamps: [],
        blockedUntil: 0,
      };

      //  If already in a block window, immediately reject
      if (entry.blockedUntil && now < entry.blockedUntil) {
        throw new HttpException(
          "Device is temporarily blocked",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      //  Filter out old hits
      const recent = entry.timestamps.filter((ts) => now - ts < windowMs);

      // If over limit, set blockedUntil _and_ persist it
      if (recent.length >= deviceLimit) {
        entry.blockedUntil = now + windowMs;
        rateLimitStore.unauthenticated.set(key, entry);
        throw new HttpException(
          "Rate limit exceeded (device)",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Otherwise record this hit and clear a stale blockUntil
      recent.push(now);
      rateLimitStore.unauthenticated.set(key, {
        timestamps: recent,
        blockedUntil: entry.blockedUntil || 0,
      });
    }
    return true;
  }
}

// ////
// // src/common/guards/rate-limit.guard.ts
// import {
//   CanActivate,
//   ExecutionContext,
//   HttpException,
//   HttpStatus,
//   Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { rateLimitStore } from '../rate-limit/rate-limit.store';
// import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

// @Injectable()
// export class RateLimitGuard implements CanActivate {
//   private readonly DEFAULT_WINDOW      = 60_000;  // 1 min
//   private readonly DEFAULT_USER_LIMIT  = 2;
//   private readonly DEFAULT_DEVICE_LIMIT= 3;

//   constructor(private readonly reflector: Reflector) {}

//   canActivate(ctx: ExecutionContext): boolean {
//     const now = Date.now();
//     const req = ctx.switchToHttp().getRequest();
//     const user = req.user;
//     const ip   = this.normalizeIp(req.ip);

//     // Unique route id
//     const handlerName = ctx.getHandler().name;
//     const className   = ctx.getClass().name;
//     const routeKey    = `${className}.${handlerName}`;

//     // Pull metadata (could be single or array)
//     const rawOpts = this.reflector.get<RateLimitOptions | RateLimitOptions[]>(
//       RATE_LIMIT_KEY,
//       ctx.getHandler(),
//     ) ?? this.reflector.get<RateLimitOptions | RateLimitOptions[]>(
//       RATE_LIMIT_KEY,
//       ctx.getClass(),
//     );

//     // Always work with an array of slots
//     const slots = Array.isArray(rawOpts) ? rawOpts : [rawOpts ?? {}];

//     // Enforce each slot in turn
//     for (const slot of slots) {
//       const windowMs    = slot.windowMs    ?? this.DEFAULT_WINDOW;
//       const userLimit   = slot.userLimit   ?? this.DEFAULT_USER_LIMIT;
//       const deviceLimit = slot.deviceLimit ?? this.DEFAULT_DEVICE_LIMIT;

//       if (user && user._id) {
//         // key per user, per route, per window
//         const key = `user-${user._id}-${routeKey}-${windowMs}`;
//         this.applySlot(
//           rateLimitStore.authenticated,
//           key,
//           now,
//           windowMs,
//           userLimit,
//           'user',
//         );

//       } else {
//         // key per IP, per route, per window
//         const key = `ip-${ip}-${routeKey}-${windowMs}`;
//         this.applySlot(
//           rateLimitStore.unauthenticated,
//           key,
//           now,
//           windowMs,
//           deviceLimit,
//           'device',
//         );
//       }
//     }

//     return true;
//   }

//   private applySlot(
//     store: Map<string, any>,
//     key: string,
//     now: number,
//     windowMs: number,
//     limit: number,
//     type: 'user' | 'device',
//   ) {
//     const entry = store.get(key) || { timestamps: [], blockedUntil: 0 };

//     // still blocked?
//     if (entry.blockedUntil > now) {
//       throw new HttpException(
//         `${type} temporarily blocked`,
//         HttpStatus.TOO_MANY_REQUESTS,
//       );
//     }

//     // drop old hits
//     const recent = entry.timestamps.filter((ts: number) => now - ts < windowMs);

//     // exceeded this slot?
//     if (recent.length >= limit) {
//       entry.blockedUntil = now + windowMs;
//       store.set(key, entry);
//       throw new HttpException(
//         `Rate limit exceeded (${type})`,
//         HttpStatus.TOO_MANY_REQUESTS,
//       );
//     }

//     // record this hit
//     recent.push(now);
//     store.set(key, { timestamps: recent, blockedUntil: entry.blockedUntil });
//   }

//   private normalizeIp(ip: string): string {
//     const m = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
//     return m ? m[1] : ip;
//   }
// }

// // allow 2 reqs per 1 min, 10 per 1 h, 100 per 1 d
// @RateLimit([
//   { windowMs:  60_000,  userLimit:  2, deviceLimit:  5 },
//   { windowMs: 3_600_000, userLimit: 10, deviceLimit: 20 },
//   { windowMs:86_400_000, userLimit:100, deviceLimit:200 },
// ])
