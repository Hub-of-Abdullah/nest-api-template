import { ApiTags } from "@nestjs/swagger";
import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtWithRefreshAuthGuard } from "src/api/auth/guards/jwt-with-refresh-auth.guard";
import { CurrentUser } from "src/decorators/current-user.decorator";
import { User } from "./schema/user.schema";
import { ApiAuth } from "src/decorators/http.decorators";

import { infinityPagination } from "src/utils/infinity-pagination";
import { RateLimitGuard } from "src/common/guards/rate-limit.guard";
import { RateLimit } from "src/common/decorators/rate-limit.decorator";

//@Controller('users')

@ApiTags("Users")
@Controller({
  path: "users",
  version: "1",
})
// @UseGuards(RateLimitGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @ApiAuth({
  //   summary: 'Get all usersfjhf',
  // })
  // @Get()
  // //@UseGuards(JwtAuthGuard)
  // @UseGuards(JwtWithRefreshAuthGuard)
  // async getUsers() {
  //   return this.usersService.getUsers();
  // }

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

    return infinityPagination(
      await this.usersService.findManyWithPagination({
        page,
        limit,
      }),
      { page, limit },
    );
  }

  //@UseGuards(JwtAuthGuard)
  @ApiAuth({
    summary: "Get current user",
  })
  @Get("me")
  @UseGuards(JwtWithRefreshAuthGuard, RateLimitGuard)
  @RateLimit({ windowMs: 30_000, userLimit: 200, deviceLimit: 2000 })
  async getMe(@CurrentUser() user: User) {
    return this.usersService.getUser({ _id: user._id });
  }
}
