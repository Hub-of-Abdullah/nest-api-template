import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { JwtWithRefreshAuthGuard } from 'src/api/auth/guards/jwt-with-refresh-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from './schema/user.schema';
import { ApiAuth, ApiPublic } from 'src/decorators/http.decorators';
import { CreateUserWithPhoneRequest } from './dto/register.req.dto';

//@Controller('users')

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})

export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiPublic({
    type: CreateUserRequest,
    summary: 'Create a new user',
  })
  @Post()
  async createUser(@Body() request: CreateUserRequest) {
    await this.usersService.create(request);
  }

  @ApiPublic({
    type: CreateUserWithPhoneRequest,
    summary: 'Create a new user with phone number',
  })
  @Post('create')
  async createUserWithPhoneNumber(@Body() user: CreateUserWithPhoneRequest): Promise<any> {
    return await this.usersService.createUserWithPhoneNumber(user);
  }

  @ApiAuth({
    summary: 'Get all users',
  })
  @Get()
  //@UseGuards(JwtAuthGuard)
  @UseGuards(JwtWithRefreshAuthGuard)
  async getUsers() {
    return this.usersService.getUsers();
  }


  //@UseGuards(JwtAuthGuard)
  @ApiAuth({
    summary: 'Get current user',
  })
  @Get('me')
  @UseGuards(JwtWithRefreshAuthGuard)
  async getMe(@CurrentUser() user: User) {
    return this.usersService.getUser({ _id: user._id });
  }

}
