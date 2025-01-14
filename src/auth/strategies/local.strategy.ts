// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-local';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly authService: AuthService) {
//     super({
//       usernameField: 'email',
//     });
//   }

//   async validate(email: string, password: string) {
//     return this.authService.verifyUser(email, password);
//   }
// }
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    console.log('LocalStrategy validate called');
    console.log('Email:', email);
    console.log('Password:', password);

    const user = await this.authService.verifyUser(email, password);

    if (!user) {
      console.log('User validation failed');
    } else {
      console.log('User validation succeeded:', user);
    }

    return user;
  }
}
