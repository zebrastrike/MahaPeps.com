import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getHealth(): string {
    return 'auth-ok';
  }
}
