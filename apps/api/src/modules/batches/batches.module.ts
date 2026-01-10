import { Module } from '@nestjs/common';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesModule } from '../files/files.module';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [PrismaModule, FilesModule, AuditModule],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}
