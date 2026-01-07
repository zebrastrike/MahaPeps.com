import { Module } from '@nestjs/common';
import { ComplianceModule } from '../../compliance/compliance.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { RecommendationsService } from './recommendations.service';
import { SearchService } from './search.service';

@Module({
  imports: [ComplianceModule, PrismaModule],
  controllers: [CatalogController],
  providers: [CatalogService, RecommendationsService, SearchService],
  exports: [CatalogService, RecommendationsService, SearchService],
})
export class CatalogModule {}
