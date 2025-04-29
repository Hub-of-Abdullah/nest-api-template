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
import { LoginReqWithPhoneDto,LoginReqWithEmailDto,LoginReqDto } from './dto/login.req.dto';
import { CreateUserWithPhoneRequest, CreateUserWithEmailRequest } from './dto/register.req.dto';


// @Controller('auth')

@ApiTags('Athentication')
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
  @UseGuards(LocalAuthGuard)
  async loginWithPhoneNumber(
    @Body() userLogin: LoginReqWithPhoneDto, 
    @Res({ passthrough: true }) response: Response, ): Promise<LoginResDto> {
    return await this.authService. loginWithPhoneNumber(userLogin, response);
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
  @UseGuards(LocalAuthGuard)
  async loginWithEmail(
    @Body() userLogin: LoginReqWithEmailDto,
    @Res({ passthrough: true }) response: Response, ): Promise<LoginResDto> {
    return await this.authService.loginWithEmail(userLogin, response);
  }


  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.loginWithPhoneNumber(user, response);
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
    await this.authService.loginWithPhoneNumber(user, response, true);
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
