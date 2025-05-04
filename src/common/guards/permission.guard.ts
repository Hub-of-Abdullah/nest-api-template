// src/common/guards/permission.guard.ts
import { CanActivate, ExecutionContext,Injectable,ForbiddenException,} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from 'src/api/permission/permission.service';
  
   
  @Injectable()
  export class PermissionGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private permissionService: PermissionService, // service to access the collection
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const permissionKey = this.reflector.get<string>(
        'permission',
        context.getHandler(),
      );

      if (!permissionKey) return true;
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;

  
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
  