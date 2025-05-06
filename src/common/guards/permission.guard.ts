// src/common/guards/permission.guard.ts
import { CanActivate, ExecutionContext,Injectable,ForbiddenException,} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from 'src/api/permission/permission.service';
  
  @Injectable()
  export class PermissionGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private permissionService: PermissionService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const permissionKey = this.reflector.get<string>(
        'permission',
        context.getHandler(),
      );
  
      // If no permission key is set, allow access
      if (!permissionKey) return true;
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      // check if user is authenticated  
      if (!user || !user._id) {
        throw new ForbiddenException('User not authenticated');
      }
  
      const hasPermission = await this.permissionService.hasPermission(
        user._id,
        permissionKey,
      );
  
      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission');
      }
  
      return true;
    }
  }
  