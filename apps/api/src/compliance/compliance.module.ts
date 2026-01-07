import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ComplianceValidationPipe } from './compliance.pipe';
import { ComplianceService } from './compliance.service';
import { ModerationService } from './moderation.service';

@Module({
  imports: [PrismaModule],
  providers: [ComplianceService, ComplianceValidationPipe, ModerationService],
  exports: [ComplianceService, ComplianceValidationPipe, ModerationService],
})
export class ComplianceModule {}
