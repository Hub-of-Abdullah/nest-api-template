import { SetMetadata } from "@nestjs/common";

export interface RateLimitOptions {
  windowMs?: number;
  userLimit?: number;
  deviceLimit?: number;
}

export const RATE_LIMIT_KEY = "rate_limit_options";

export const RateLimit = (opts: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, opts);
