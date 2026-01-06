import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { ComplianceValidationPipe } from '../../compliance/compliance.pipe';
import { CatalogService } from './catalog.service';

interface CreateProductDto {
  name: string;
  description: string;
}

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @UsePipes(ComplianceValidationPipe)
  create(@Body() dto: CreateProductDto) {
    return this.catalogService.create(dto);
  }

  @Get('health')
  getHealth(): string {
    return this.catalogService.getHealth();
  }
}
