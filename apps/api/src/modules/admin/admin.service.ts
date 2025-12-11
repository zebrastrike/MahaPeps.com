import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getHealth(): string {
    return 'admin-ok';
  }
}
