import { Module } from '@nestjs/common';
import { ComplianceModule } from '../../compliance/compliance.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesModule } from '../files/files.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CatalogVisibilityService } from './catalog-visibility.service';
import { PricingService } from './pricing.service';
import { PurchasabilityService } from './purchasability.service';
import { RecommendationsService } from './recommendations.service';
import { SearchService } from './search.service';

@Module({
  imports: [ComplianceModule, PrismaModule, FilesModule],
  controllers: [CatalogController],
  providers: [
    CatalogService,
    CatalogVisibilityService,
    PricingService,
    PurchasabilityService,
    RecommendationsService,
    SearchService,
  ],
  exports: [
    CatalogService,
    CatalogVisibilityService,
    PricingService,
    PurchasabilityService,
    RecommendationsService,
    SearchService,
  ],
})
export class CatalogModule {}
