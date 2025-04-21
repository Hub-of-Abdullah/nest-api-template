import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from './schema/user.schema';
import { ApiPublic } from 'src/decorators/http.decorators';
import { CreateUserWithPhoneRequest } from './dto/register.req.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // create a new user

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserRequest })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
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

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard)
  async getUsers(@CurrentUser() user: User) {
    console.log(user);
    return this.usersService.getUsers();
  }



  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Return current user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: User) {
    return this.usersService.getUser({ _id: user._id });
  }

}
