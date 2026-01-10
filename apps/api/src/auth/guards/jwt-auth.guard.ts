import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isOptional = this.reflector.getAllAndOverride<boolean>('jwt-optional', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isOptional) {
      return (await super.canActivate(context)) as boolean;
    }

    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isOptional = this.reflector.getAllAndOverride<boolean>('jwt-optional', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (err || !user) {
      if (isOptional) {
        return null;
      }
      throw err || new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }
}
