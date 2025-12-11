import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  getHealth(): string {
    return 'notifications-ok';
  }
}
