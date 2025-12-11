import { Controller, Get } from '@nestjs/common';
import { BatchesService } from './batches.service';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get('health')
  getHealth(): string {
    return this.batchesService.getHealth();
  }
}
