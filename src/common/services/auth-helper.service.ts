import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { hash, compare } from "bcryptjs";

@Injectable()
export class AuthHelperService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get<number>("BCRYPT_ROUNDS", 12);
    return hash(password, rounds);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await compare(password, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  generateAccessToken(userId: string): string {
    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.getOrThrow("JWT_ACCESS_TOKEN_SECRET"),
        expiresIn: `${this.configService.getOrThrow("JWT_ACCESS_TOKEN_EXPIRATION_MS")}ms`,
      },
    );
  }

  generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.getOrThrow("JWT_REFRESH_TOKEN_SECRET"),
        expiresIn: `${this.configService.getOrThrow("JWT_REFRESH_TOKEN_EXPIRATION_MS")}ms`,
      },
    );
  }

  async hashRefreshToken(refreshToken: string): Promise<string> {
    return hash(refreshToken, 10);
  }

  setAuthCookies(
    accessToken: string,
    refreshToken: string,
    response: Response,
  ): void {
    const accessExpires = new Date();
    accessExpires.setTime(
      accessExpires.getTime() +
        this.configService.getOrThrow("JWT_ACCESS_TOKEN_EXPIRATION_MS"),
    );

    const refreshExpires = new Date();
    refreshExpires.setTime(
      refreshExpires.getTime() +
        this.configService.getOrThrow("JWT_REFRESH_TOKEN_EXPIRATION_MS"),
    );

    const isProduction = this.configService.get("NODE_ENV") === "production";

    response.cookie("Authentication", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      expires: accessExpires,
    });

    response.cookie("Refresh", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      expires: refreshExpires,
    });
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie("Authentication");
    response.clearCookie("Refresh");
  }
}
