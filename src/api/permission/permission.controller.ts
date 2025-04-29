import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionRequestDto } from './dto/create-permission.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth } from 'src/decorators/http.decorators';
import { JwtWithRefreshAuthGuard } from '../auth/guards/jwt-with-refresh-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from '../users/schema/user.schema';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';


@ApiTags('Athorization')
@Controller({
  path: 'auth',
  version: '1',
})
@UseGuards(JwtWithRefreshAuthGuard, PermissionGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
@ApiAuth({
    type: PermissionRequestDto,
    summary: 'Create a new permission to grant access to the user',
  })
  @Permission('permission.add')
  @Post('permission/create')
  async createPermission(@Body() permission: PermissionRequestDto, @CurrentUser() user: User): Promise<any> {
    return await this.permissionService.createPermission(permission,user._id);
  }

  
  @Get('permission/get')
  @ApiAuth({
     //type: PermissionRequestDto,
    summary: 'Get all permissions',
  })
  @Permission('permission.view-all')
  async getPermissions() {
    return await this.permissionService.getPermissions();
  }

  
  @Get('permission/get/:id')
  @ApiAuth({
    summary: 'Get permission by user id',
  })
  @Permission('permission.view')
  async getPermissionsByUserId(@Param('id') id: string): Promise<any> {
    return await this.permissionService.getPermissionsByUserId({ userId: id, isPublished: true, isDeleted: false });  
  }



  @Patch('permission/update/:id')
  @ApiAuth({
    summary: 'Update permission by id test', 
  })
  @Permission('permission.update')
  async updatePermission(@Param('id') id: string, @Body() permissionRequestDto: PermissionRequestDto, @CurrentUser() user: User): Promise<any> {
    return await this.permissionService.updatePermission({ _id: id, isPublished: true, isDeleted: false  }, permissionRequestDto, user._id);
  }


  @Delete('permission/delete/:id')
  @ApiAuth({
    summary: 'Delete permission by id',
  })
  @Permission('permission.delete')
  async deletePermission(@Param('id') id: string,  @CurrentUser() user: User): Promise<any> {
    return await this.permissionService.deletePermission({ _id: id, isPublished: true, isDeleted: false  }, user._id);
  }
}
