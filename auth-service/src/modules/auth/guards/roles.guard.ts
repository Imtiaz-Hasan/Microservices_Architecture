import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      // Custom message for admin-only actions
      if (requiredRoles.includes(UserRole.ADMIN)) {
        throw new ForbiddenException('Only admin users can delete users.');
      }
      throw new ForbiddenException('You do not have the required role to access this resource.');
    }
    return true;
  }
} 