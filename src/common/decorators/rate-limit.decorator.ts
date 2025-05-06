// // src/common/decorators/rate-limit.decorator.ts
// import { SetMetadata } from '@nestjs/common';

// export interface RateLimitOptions {
//   windowMs?: number;
//   userLimit?: number;
//   deviceLimit?: number;
// }

// // the metadata key you’ll use to retrieve options
// export const RATE_LIMIT_KEY = 'rate_limit_options';

// /**
//  * @RateLimit({ windowMs: 60_000, userLimit: 5, deviceLimit: 10 })
//  * If you omit any of the fields, the guard will fall back to its defaults.
//  */
// export const RateLimit = (opts: RateLimitOptions) =>
//   SetMetadata(RATE_LIMIT_KEY, opts);


import { SetMetadata } from '@nestjs/common';
export interface RateLimitOptions {
    windowMs?: number;
    userLimit?: number;
    deviceLimit?: number;
  }
  export const RATE_LIMIT_KEY = 'rate_limit_options';
  export const RateLimit = (opts: RateLimitOptions) =>
    SetMetadata(RATE_LIMIT_KEY, opts);



//   // src/common/decorators/rate-limit.decorator.ts
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
