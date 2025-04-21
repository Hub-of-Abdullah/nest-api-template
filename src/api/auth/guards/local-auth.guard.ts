import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}


// import { Injectable, ExecutionContext } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class LocalAuthGuard extends AuthGuard('local') {
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     console.log('LocalAuthGuard canActivate called');

    // Call the parent class's `canActivate` method
    // const result = await super.canActivate(context);

    // console.log('Result of super.canActivate:', result);

    // return result as boolean;

//     return true;
//   }
// }
