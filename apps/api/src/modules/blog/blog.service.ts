import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new blog post
   */
  async create(createBlogDto: CreateBlogDto) {
    this.logger.log(`Creating new blog post: ${createBlogDto.title}`);

    // Check if slug already exists
    const existingBlog = await this.prisma.blog.findUnique({
      where: { slug: createBlogDto.slug },
    });

    if (existingBlog) {
      throw new ConflictException(`Blog with slug "${createBlogDto.slug}" already exists`);
    }

    return this.prisma.blog.create({
      data: {
        title: createBlogDto.title,
        slug: createBlogDto.slug,
        content: createBlogDto.content,
        excerpt: createBlogDto.excerpt,
        featuredImage: createBlogDto.featuredImage,
        seoTitle: createBlogDto.seoTitle,
        seoDescription: createBlogDto.seoDescription,
        keywords: createBlogDto.keywords,
        isPublished: createBlogDto.isPublished ?? false,
        publishedAt: createBlogDto.publishedAt ? new Date(createBlogDto.publishedAt) : null,
      },
    });
  }

  /**
   * Get all blog posts (admin)
   */
  async findAll() {
    return this.prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get published blog posts only (public)
   */
  async findPublished() {
    return this.prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        seoTitle: true,
        seoDescription: true,
        keywords: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get single blog post by ID
   */
  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }

    return blog;
  }

  /**
   * Get single blog post by slug (public)
   */
  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
    });

    if (!blog) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    if (!blog.isPublished) {
      throw new NotFoundException(`Blog post with slug "${slug}" is not published`);
    }

    return blog;
  }

  /**
   * Update blog post
   */
  async update(id: string, updateBlogDto: UpdateBlogDto) {
    // Check if blog exists
    await this.findOne(id);

    // If slug is being updated, check if it's already taken
    if (updateBlogDto.slug) {
      const existingBlog = await this.prisma.blog.findUnique({
        where: { slug: updateBlogDto.slug },
      });

      if (existingBlog && existingBlog.id !== id) {
        throw new ConflictException(`Blog with slug "${updateBlogDto.slug}" already exists`);
      }
    }

    this.logger.log(`Updating blog post ${id}`);

    return this.prisma.blog.update({
      where: { id },
      data: {
        ...updateBlogDto,
        publishedAt: updateBlogDto.publishedAt ? new Date(updateBlogDto.publishedAt) : undefined,
      },
    });
  }

  /**
   * Toggle published status
   */
  async togglePublished(id: string) {
    const blog = await this.findOne(id);

    this.logger.log(`Toggling published status for blog ${id}: ${!blog.isPublished}`);

    return this.prisma.blog.update({
      where: { id },
      data: {
        isPublished: !blog.isPublished,
        publishedAt: !blog.isPublished && !blog.publishedAt ? new Date() : blog.publishedAt,
      },
    });
  }

  /**
   * Delete blog post
   */
  async remove(id: string) {
    // Check if blog exists
    await this.findOne(id);

    this.logger.log(`Deleting blog post ${id}`);

    await this.prisma.blog.delete({
      where: { id },
    });

    return { success: true, message: 'Blog post deleted successfully' };
  }
}
