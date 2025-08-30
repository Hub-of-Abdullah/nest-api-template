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
  private readonly DEFAULT_WINDOW = 60_000; // 1 min
  private readonly DEFAULT_USER_LIMIT = 2;
  private readonly DEFAULT_DEVICE_LIMIT = 3;

  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const now = Date.now();
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    const ip = this.normalizeIp(req.ip);

    // Unique route id
    const handlerName = ctx.getHandler().name;
    const className = ctx.getClass().name;
    const routeKey = `${className}.${handlerName}`;

    // Pull metadata (could be single or array)
    const rawOpts =
      this.reflector.get<RateLimitOptions | RateLimitOptions[]>(
        RATE_LIMIT_KEY,
        ctx.getHandler(),
      ) ??
      this.reflector.get<RateLimitOptions | RateLimitOptions[]>(
        RATE_LIMIT_KEY,
        ctx.getClass(),
      );

    // Always work with an array of slots
    const slots = Array.isArray(rawOpts) ? rawOpts : [rawOpts ?? {}];

    // Enforce each slot in turn
    for (const slot of slots) {
      const windowMs = slot.windowMs ?? this.DEFAULT_WINDOW;
      const userLimit = slot.userLimit ?? this.DEFAULT_USER_LIMIT;
      const deviceLimit = slot.deviceLimit ?? this.DEFAULT_DEVICE_LIMIT;

      if (user && user._id) {
        // key per user, per route, per window
        const key = `user-${user._id}-${routeKey}-${windowMs}`;
        this.applySlot(
          rateLimitStore.authenticated,
          key,
          now,
          windowMs,
          userLimit,
          "user",
        );
      } else {
        // key per IP, per route, per window
        const key = `ip-${ip}-${routeKey}-${windowMs}`;
        this.applySlot(
          rateLimitStore.unauthenticated,
          key,
          now,
          windowMs,
          deviceLimit,
          "device",
        );
      }
    }

    return true;
  }

  private applySlot(
    store: Map<string, any>,
    key: string,
    now: number,
    windowMs: number,
    limit: number,
    type: "user" | "device",
  ) {
    const entry = store.get(key) || { timestamps: [], blockedUntil: 0 };

    // still blocked?
    if (entry.blockedUntil > now) {
      throw new HttpException(
        `${type} temporarily blocked`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // drop old hits
    entry.timestamps = entry.timestamps.filter(
      (timestamp: number) => now - timestamp < windowMs,
    );

    // check limit
    if (entry.timestamps.length >= limit) {
      entry.blockedUntil = now + windowMs;
      store.set(key, entry);
      throw new HttpException(
        `${type} rate limit exceeded`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // add current hit
    entry.timestamps.push(now);
    store.set(key, entry);
  }

  private normalizeIp(ip: string): string {
    // Handle IPv6 mapped IPv4 addresses
    if (ip.startsWith("::ffff:")) {
      return ip.substring(7);
    }
    return ip;
  }
}
