import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchesService {
  getHealth(): string {
    return 'batches-ok';
  }
}
