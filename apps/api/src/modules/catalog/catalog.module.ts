import { Module } from '@nestjs/common';
import { ComplianceModule } from '../../compliance/compliance.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  imports: [ComplianceModule],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
