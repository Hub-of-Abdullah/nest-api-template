import { SetMetadata } from '@nestjs/common';
export interface RateLimitOptions {
    windowMs?: number;
    userLimit?: number;
    deviceLimit?: number;
  }
  export const RATE_LIMIT_KEY = 'rate_limit_options';
  export const RateLimit = (opts: RateLimitOptions) =>
    SetMetadata(RATE_LIMIT_KEY, opts);





//   // src/common/decorators/rate-limit.decorator.ts for multiple limits
// import { SetMetadata } from '@nestjs/common';

// export interface RateLimitOptions {
//   windowMs?: number;
//   userLimit?: number;
//   deviceLimit?: number;
// }

// /** 
//  * Accepts either a single set of limits or an array of them.
//  */
// export const RATE_LIMIT_KEY = 'rate_limit_options';
// export const RateLimit = (
//   opts: RateLimitOptions | RateLimitOptions[],
// ) => SetMetadata(RATE_LIMIT_KEY, opts);
