// src/common/rate-limit/rate-limit.store.ts

export const rateLimitStore = {
  unauthenticated: new Map<
    string,
    { timestamps: number[]; blockedUntil?: number }
  >(),
  authenticated: new Map<string, number[]>(),
};
