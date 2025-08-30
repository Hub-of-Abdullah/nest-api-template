import { ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CreateUserRequest } from "./dto/create-user.request";
import { UsersService } from "./users.service";
import { JwtWithRefreshAuthGuard } from "../auth/guards/jwt-with-refresh-auth.guard";
import { CurrentUser } from "../../decorators/current-user.decorator";
import { User } from "./schema/user.schema";
import { ApiAuth, ApiPublic } from "../../decorators/http.decorators";
import { CreateUserWithPhoneRequest } from "./dto/register.req.dto";
import { RateLimitGuard } from "../../common/guards/rate-limit.guard";
import { RateLimit } from "../../common/decorators/rate-limit.decorator";

@ApiTags("Users")
@Controller({
  path: "users",
  version: "1",
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiPublic({
    type: CreateUserRequest,
    summary: "Create a new user",
  })
  @Post()
  async createUser(@Body() _request: CreateUserRequest) {
    // await this.usersService.createUser(request);
  }

  @ApiPublic({
    type: CreateUserWithPhoneRequest,
    summary: "Create a new user with phone number",
  })
  @Post("create")
  @UseGuards(RateLimitGuard)
  @RateLimit({ windowMs: 30_000, userLimit: 3, deviceLimit: 10 })
  async createUserWithPhoneNumber(
    @Body() _user: CreateUserWithPhoneRequest,
  ): Promise<any> {
    // return await this.usersService.createUserWithPhone(user);
  }

  @ApiAuth({
    summary: "Get all users paginated",
  })
  @Get()
  @UseGuards(JwtWithRefreshAuthGuard, RateLimitGuard)
  @RateLimit({ windowMs: 10_000, userLimit: 2, deviceLimit: 2 })
  async findAllUser(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(1), ParseIntPipe) limit: number,
  ) {
    if (limit > 2) {
      limit = 2;
    }

    // return infinityPagination(
    //   await this.usersService.getUsers({
    //     page,
    //     limit,
    //   }),
    //   { page, limit },
    // );
  }

  @ApiAuth({
    summary: "Get current user",
  })
  @Get("me")
  @UseGuards(JwtWithRefreshAuthGuard, RateLimitGuard)
  @RateLimit({ windowMs: 30_000, userLimit: 5, deviceLimit: 10 })
  async getMe(@CurrentUser() _user: User) {
    // return this.usersService.getUser({ _id: user._id });
  }
}
