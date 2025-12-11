import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  getHealth(): string {
    return 'payments-ok';
  }
}
