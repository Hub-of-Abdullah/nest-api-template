// auth/token-refresh.middleware.ts

import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';


@Injectable()
export class TokenRefreshMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (accessToken) {
      try {
        // Verify if access token is still valid
        this.jwtService.verify(accessToken, { secret: process.env.JWT_ACCESS_SECRET });
      } catch (accessError) {
        // Access token is expired, check refresh token
        if (refreshToken) {
          try {
            const refreshPayload = this.jwtService.verify(refreshToken, {
              secret: process.env.JWT_REFRESH_SECRET,
            });

            // Validate user from refresh token
            const user = await this.authService.validateUserById(refreshPayload.sub);
            if (!user) throw new Error('Invalid user');

            // Generate new tokens


            
            const newAccessToken = this.jwtService.sign(
              { sub: user._id, type: 'access' },
              { expiresIn: '15m' },
            );


            const newRefreshToken = this.jwtService.sign(
              { sub: user._id, type: 'refresh' },
              { expiresIn: '7d' },
            );



            // Set new tokens in cookies
            res.cookie('accessToken', newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 15 * 60 * 1000, // 15 minutes
            });
            res.cookie('refreshToken', newRefreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // Update the request with the new access token (for current request)
            req.cookies.accessToken = newAccessToken;
          } catch (refreshError) {
            // Refresh token is invalid, clear cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(HttpStatus.UNAUTHORIZED).send('Session expired');
            return;
          }
        }
      }
    }
    next();
  }
}