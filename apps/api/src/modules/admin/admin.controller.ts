import { Controller, Get, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ModerationService } from '../../compliance/moderation.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly moderationService: ModerationService,
  ) {}

  @Get('health')
  getHealth(): string {
    return this.adminService.getHealth();
  }

  /**
   * Scan all products for compliance violations
   * GET /admin/moderation/scan
   */
  @Get('moderation/scan')
  async scanProducts() {
    return this.moderationService.scanAllProducts();
  }

  /**
   * Get moderation statistics
   * GET /admin/moderation/stats
   */
  @Get('moderation/stats')
  async getModerationStats() {
    return this.moderationService.getModerationStats();
  }

  /**
   * Scan single product
   * GET /admin/moderation/product/:productId
   */
  @Get('moderation/product/:productId')
  async scanProduct(@Param('productId') productId: string) {
    return this.moderationService.scanProduct(productId);
  }

  /**
   * Get suggested fixes for product
   * GET /admin/moderation/product/:productId/fixes
   */
  @Get('moderation/product/:productId/fixes')
  async getSuggestedFixes(@Param('productId') productId: string) {
    return this.moderationService.getSuggestedFixes(productId);
  }
}
