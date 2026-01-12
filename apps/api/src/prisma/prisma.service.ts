import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly encryption: EncryptionService;

  constructor() {
    super();
    this.encryption = new EncryptionService();
  }

  async onModuleInit() {
    await this.$connect();

    // TODO: Re-implement encryption middleware using Prisma Extensions (v5+)
    // The $use() middleware has been deprecated - needs migration to $extends()
    // For now, encryption is disabled to allow server startup
    // See: https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
