import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

export interface AdminUserContext {
  id: string;
  role: UserRole;
  email: string;
}

export interface AdminRequest extends Request {
  adminUser?: AdminUserContext;
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const headerValue = request.headers['x-admin-user-id'];

    if (!headerValue || Array.isArray(headerValue)) {
      throw new UnauthorizedException('Missing x-admin-user-id header');
    }

    const adminUser = await this.prisma.user.findUnique({
      where: { id: headerValue },
      select: { id: true, role: true, isActive: true, email: true },
    });

    if (!adminUser || !adminUser.isActive) {
      throw new ForbiddenException('Admin user is inactive or missing');
    }

    if (adminUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    request.adminUser = {
      id: adminUser.id,
      role: adminUser.role,
      email: adminUser.email,
    };

    return true;
  }
}
