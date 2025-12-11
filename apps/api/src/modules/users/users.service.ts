import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getHealth(): string {
    return 'users-ok';
  }
}
