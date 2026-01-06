import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ComplianceValidationPipe } from './compliance.pipe';
import { ComplianceService } from './compliance.service';

@Module({
  imports: [PrismaModule],
  providers: [ComplianceService, ComplianceValidationPipe],
  exports: [ComplianceService, ComplianceValidationPipe],
})
export class ComplianceModule {}
