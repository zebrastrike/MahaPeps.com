import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * PUBLIC: Get all published blog posts
   */
  @Get()
  findPublished() {
    return this.blogService.findPublished();
  }

  /**
   * PUBLIC: Get single blog post by slug
   */
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }
}

/**
 * ADMIN BLOG CONTROLLER
 * All routes require admin authentication (to be added with guards)
 */
@Controller('admin/blog')
export class AdminBlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * Create new blog post
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  /**
   * Get all blog posts (including unpublished)
   */
  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  /**
   * Get single blog post by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  /**
   * Update blog post
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  /**
   * Toggle published status
   */
  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  togglePublished(@Param('id') id: string) {
    return this.blogService.togglePublished(id);
  }

  /**
   * Delete blog post
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
