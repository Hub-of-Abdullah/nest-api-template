import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'phone', // Changed from 'email' to 'phone'
    });
  }
  async validate(phone: string, password: string): Promise<any> {
    console.log('LocalStrategy validate called');
    const user = await this.authService.verifyUserByPhone(phone, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
