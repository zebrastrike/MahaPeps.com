import { Body, Controller, Get, Post, Param, Query, UsePipes } from '@nestjs/common';
import { ComplianceValidationPipe } from '../../compliance/compliance.pipe';
import { CatalogService } from './catalog.service';
import { RecommendationsService } from './recommendations.service';
import { SearchService } from './search.service';

interface CreateProductDto {
  name: string;
  description: string;
}

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly recommendationsService: RecommendationsService,
    private readonly searchService: SearchService,
  ) {}

  @Post()
  @UsePipes(ComplianceValidationPipe)
  create(@Body() dto: CreateProductDto) {
    return this.catalogService.create(dto);
  }

  @Get('health')
  getHealth(): string {
    return this.catalogService.getHealth();
  }

  /**
   * Get public catalog products
   * GET /catalog/products
   */
  @Get('products')
  async getProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.catalogService.listProducts(limitNum);
  }

  /**
   * Get product recommendations for a specific product
   * GET /catalog/products/:productId/recommendations
   */
  @Get('products/:productId/recommendations')
  async getProductRecommendations(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 4;
    return this.recommendationsService.getProductRecommendations(productId, limitNum);
  }

  /**
   * Get personalized recommendations for a user
   * GET /catalog/recommendations/user/:userId
   */
  @Get('recommendations/user/:userId')
  async getUserRecommendations(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 6;
    return this.recommendationsService.getUserRecommendations(userId, limitNum);
  }

  /**
   * Get trending products
   * GET /catalog/recommendations/trending
   */
  @Get('recommendations/trending')
  async getTrendingProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 6;
    return this.recommendationsService.getTrendingProducts(limitNum);
  }

  /**
   * Get similar products by category
   * GET /catalog/products/:productId/similar
   */
  @Get('products/:productId/similar')
  async getSimilarProducts(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 4;
    return this.recommendationsService.getSimilarProducts(productId, limitNum);
  }

  /**
   * Get product by slug or id
   * GET /catalog/products/:slugOrId
   */
  @Get('products/:slugOrId')
  async getProductBySlug(@Param('slugOrId') slugOrId: string) {
    return this.catalogService.getProductBySlug(slugOrId);
  }

  /**
   * Advanced product search
   * GET /catalog/search?q=...&category=...&minPurity=...
   */
  @Get('search')
  async searchProducts(
    @Query('q') query: string = '',
    @Query('category') category?: string,
    @Query('minPurity') minPurity?: string,
    @Query('maxPurity') maxPurity?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('hasCoa') hasCoa?: string,
    @Query('isActive') isActive?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      category,
      minPurity: minPurity ? parseFloat(minPurity) : undefined,
      maxPurity: maxPurity ? parseFloat(maxPurity) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      hasCoa: hasCoa === 'true' ? true : hasCoa === 'false' ? false : undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };

    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.searchService.searchProducts(query, filters, limitNum);
  }

  /**
   * Get search suggestions/autocomplete
   * GET /catalog/search/suggestions?q=...
   */
  @Get('search/suggestions')
  async getSuggestions(@Query('q') query: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.searchService.getSuggestions(query, limitNum);
  }

  /**
   * Get filter options for search
   * GET /catalog/search/filters
   */
  @Get('search/filters')
  async getFilterOptions() {
    return this.searchService.getFilterOptions();
  }

  /**
   * Search by specific field
   * GET /catalog/search/field/:field?value=...
   */
  @Get('search/field/:field')
  async searchByField(@Param('field') field: string, @Query('value') value: string) {
    return this.searchService.searchByField(field, value);
  }
}
