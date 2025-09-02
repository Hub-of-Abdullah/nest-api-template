import { Response } from "express";
import { appConfig } from "../config/config";

const isProd = appConfig.server.nodeEnv === "production";

export const setCookie = (
  response: Response,
  name: string,
  value: string,
  expiresAt: number, // timestamp in milliseconds
) => {
  const expires = new Date(expiresAt); // Convert to Date

  response.cookie(name, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax", // Use 'lax' in development, 'none' in production
    expires: expires, // Must be a Date object
  });
};

export const clearCookie = (response: Response, name: string) => {
  response.clearCookie(name, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
};
