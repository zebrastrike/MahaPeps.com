import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    userId?: string;
    adminId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    changesBefore?: unknown;
    changesAfter?: unknown;
    metadata?: unknown;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.prisma.auditLog.create({
      data: {
        ...params,
        timestamp: new Date(),
      },
    });
  }
}
