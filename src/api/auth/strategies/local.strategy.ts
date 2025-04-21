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
    // super({
    //   usernameField: 'username',
    // });
    super();
  }

  async validate(username: string, password: string) {
    console.log('LocalStrategy validate called');
    console.log('Email:', username);
    console.log('Password:', password);

    const user = await this.authService.verifyUserByEmailOrPhone(username, password);
    if (!user) {
      console.log('User validation failed');
    } else {
      console.log('User validation succeeded:', user);
    }

    return user;
  }

}


// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-local';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly authService: AuthService) {
//     // Set usernameField to 'email' initially, you will handle validation within the validate method
//     super({
//       usernameField: 'username', // Can be either 'email' or 'phoneNumber'
//     });
//   }

//   async validate(username: string, password: string) {
//     console.log('LocalStrategy validate called');
//     console.log('Username:', username);
//     console.log('Password:', password);

//     // Try to find the user by either email or phoneNumber
//     const user = await this.authService.verifyUserByEmailOrPhone(username, password);
    
//     if (!user) {
//       console.log('User validation failed');
//     } else {
//       console.log('User validation succeeded:', user);
//     }

//     return user;
//   }
// }
