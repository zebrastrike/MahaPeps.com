import { Controller, Get } from '@nestjs/common';
@Controller('users')
export class UsersController {
  @Get('health')
  getHealth(): string {
    return 'users-ok';
  }
}
