import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminRequest, AdminUserContext } from './admin.guard';

export const AdminActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminUserContext | undefined => {
    const request = ctx.switchToHttp().getRequest<AdminRequest>();
    return request.adminUser;
  },
);
