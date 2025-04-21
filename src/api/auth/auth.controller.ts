import { Controller, Get, Post, Res, UseGuards, HttpStatus, Body } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../users/schema/user.schema';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiPublic } from 'src/decorators/http.decorators';
import { LoginResDto } from './dto/login.res.dto';
import { LoginReqWithPhoneDto,LoginReqWithEmailDto,LoginDto } from './dto/login.req.dto';
import { CreateUserWithPhoneRequest, CreateUserWithEmailRequest } from './dto/register.req.dto';


// @Controller('auth')

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiPublic({
    type: CreateUserWithPhoneRequest,
    summary: 'Signup with phone number and password',
  })
  @Post('phone/register')
   async registerWithPhoneNumber(@Body() user: CreateUserWithPhoneRequest): Promise<any> {
     return await this.authService.createUserWithPhoneNumber(user);
   }


   @ApiPublic({
    type: LoginReqWithPhoneDto,
    summary: 'Sign in with phone number and password',
  })
  @Post('phone/login')
  async loginWithPhoneNumber(
    @Body() userLogin: LoginReqWithPhoneDto, 
    @Res({ passthrough: true }) response: Response, ): Promise<LoginResDto> {
    return await this.authService.loginWithPhoneNumber(userLogin, response);
  }


   @ApiPublic({
    type: CreateUserWithEmailRequest,
    summary: 'Signup with Email and password',
  })
  @Post('email/register')
   async registerWithEmailNumber(@Body() user: CreateUserWithEmailRequest): Promise<any> {
     return await this.authService.createUserWithEmail(user);
   }

 
   @ApiPublic({
    type: LoginReqWithEmailDto,
    summary: 'Sign in with Email and password',
  })
  @Post('email/login')
  async loginWithEmail(
    @Body() userLogin: LoginReqWithEmailDto,
    @Res({ passthrough: true }) response: Response, ): Promise<LoginResDto> {
    return await this.authService.loginWithEmail(userLogin, response);
  }
 

  @ApiPublic({
    type: LoginDto,
    summary: 'Sign in with Email and password',
  })
 @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('Login method called');
    console.log('User object:', user); // Log the user object for debugging
    await this.authService.login(user, response);
  }



  

//   // login method with response
//   @Post('login')
//  // @UseGuards(LocalAuthGuard)
//   @ApiOperation({ summary: 'Login with email and password' })
//   @ApiBody({
//     description: 'The credentials needed to login',
//     schema: {
//       type: 'object',
//       properties: {
//         email: { type: 'string', format: 'email' },
//         password: { type: 'string', minLength: 6 },
//       },
//       required: ['email', 'password'],
//     },
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Successfully logged in',
//   })
//   @ApiResponse({
//     status: 401,
//     description: 'Invalid login credentials',
//   })
//   async login(
//     @CurrentUser() user: User,
//     @Res({ passthrough: true }) response: Response,
//   ) {
//     try {
//       console.log('Login method called');
//       const result = await this.authService.login(user, response);
//       response.status(HttpStatus.OK).json({
//         message: 'Successfully logged in',
//         data: result,
//       });
//     } catch (error) {
//       response.status(HttpStatus.UNAUTHORIZED).json({
//         message: 'Invalid login credentials',
//       });
//     }
//   }


  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  loginGoogle() { }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response, true);
  }
}



 // @Post('login')
  // @UseGuards(LocalAuthGuard)
  // async login(
  //   @CurrentUser() user: User,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   await this.authService.login(user, response);
  // }