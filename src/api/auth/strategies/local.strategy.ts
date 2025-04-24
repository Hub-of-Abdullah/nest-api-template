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


// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-local';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly authService: AuthService) {
//     super({
//       usernameField: 'username', // Can be phone or email
//     });
//   }

//   async validate(username: string, password: string): Promise<any> {

//     console.log('LocalStrategy validate called');
//     console.log('Username:', username);
//     let user;
//     if (this.isEmail(username)) {
//       user = await this.authService.verifyUserByEmail(username, password);
//     } else {
//       user = await this.authService.verifyUserByPhone(username, password);
//     }

//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     return user;
//   }

//   private isEmail(value: string): boolean {
//     // Simple regex to check if value looks like an email
//     return /\S+@\S+\.\S+/.test(value);
//   }
// }


