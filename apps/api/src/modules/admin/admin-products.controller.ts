import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComplianceValidationPipe } from '../../compliance/compliance.pipe';
import { AdminActor } from './admin.decorator';
import { AdminGuard, AdminUserContext } from './admin.guard';
import { AdminProductsService } from './admin-products.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get('products')
  async listProducts(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.adminProductsService.listProducts({
      q,
      category,
      isActive: this.parseOptionalBoolean(isActive),
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('products/:productId')
  async getProduct(@Param('productId') productId: string) {
    return this.adminProductsService.getProductById(productId);
  }

  @Post('products')
  @UsePipes(ComplianceValidationPipe)
  async createProduct(
    @Body() body: unknown,
    @AdminActor() actor: AdminUserContext,
  ) {
    return this.adminProductsService.createProduct(body, actor);
  }

  @Patch('products/:productId')
  @UsePipes(ComplianceValidationPipe)
  async updateProduct(
    @Param('productId') productId: string,
    @Body() body: unknown,
    @AdminActor() actor: AdminUserContext,
  ) {
    return this.adminProductsService.updateProduct(productId, body, actor);
  }

  @Post('products/bulk')
  async bulkUpdate(
    @Body() body: unknown,
    @AdminActor() actor: AdminUserContext,
  ) {
    return this.adminProductsService.bulkUpdate(body, actor);
  }

  @Post('products/:productId/variants')
  async createVariant(
    @Param('productId') productId: string,
    @Body() body: unknown,
    @AdminActor() actor: AdminUserContext,
  ) {
    return this.adminProductsService.createVariant(productId, body, actor);
  }

  @Patch('variants/:variantId')
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() body: unknown,
    @AdminActor() actor: AdminUserContext,
  ) {
    return this.adminProductsService.updateVariant(variantId, body, actor);
  }

  @Post('variants/:variantId/batches')
  async createBatch(
    @Param('variantId') variantId: string,
    @Body() body: unknown,
    @AdminActor() actor: AdminUserContext,
  ) {
    return this.adminProductsService.createBatch(variantId, body, actor);
  }

  @Post('batches/:batchId/coa')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoa(
    @Param('batchId') batchId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: unknown,
    @AdminActor() actor: AdminUserContext,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.adminProductsService.uploadCoa(batchId, file, body, actor);
  }

  @Post('batches/:batchId/activate')
  async activateBatch(
    @Param('batchId') batchId: string,
    @AdminActor() actor: AdminUserContext,
  ) {
    return this.adminProductsService.activateBatch(batchId, actor);
  }

  private parseOptionalBoolean(value?: string): boolean | undefined {
    if (value === undefined) return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }
}
