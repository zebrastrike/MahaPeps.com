import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  getHealth(): string {
    return 'orders-ok';
  }
}
