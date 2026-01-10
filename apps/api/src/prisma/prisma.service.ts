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

    this.$use(async (params, next) => {
      if (
        (params.action === 'create' ||
          params.action === 'update' ||
          params.action === 'updateMany') &&
        params.args?.data
      ) {
        if (params.model === 'User') {
          if (typeof params.args.data.name === 'string') {
            params.args.data.name = this.encryption.encrypt(params.args.data.name);
          }
          if (typeof params.args.data.phone === 'string') {
            params.args.data.phone = this.encryption.encrypt(params.args.data.phone);
          }
        }

        if (params.model === 'Address') {
          if (typeof params.args.data.line1 === 'string') {
            params.args.data.line1 = this.encryption.encrypt(params.args.data.line1);
          }
          if (typeof params.args.data.line2 === 'string') {
            params.args.data.line2 = this.encryption.encrypt(params.args.data.line2);
          }
          if (typeof params.args.data.city === 'string') {
            params.args.data.city = this.encryption.encrypt(params.args.data.city);
          }
          if (typeof params.args.data.postalCode === 'string') {
            params.args.data.postalCode = this.encryption.encrypt(
              params.args.data.postalCode,
            );
          }
        }
      }

      const result = await next(params);

      if (
        params.action === 'findUnique' ||
        params.action === 'findFirst' ||
        params.action === 'findMany'
      ) {
        if (params.model === 'User') {
          const decryptUser = (record: any) => {
            if (!record) return record;
            if (typeof record.name === 'string') {
              record.name = this.encryption.decrypt(record.name);
            }
            if (typeof record.phone === 'string') {
              record.phone = this.encryption.decrypt(record.phone);
            }
            return record;
          };

          if (Array.isArray(result)) {
            return result.map(decryptUser);
          }

          return decryptUser(result);
        }

        if (params.model === 'Address') {
          const decryptAddress = (record: any) => {
            if (!record) return record;
            if (typeof record.line1 === 'string') {
              record.line1 = this.encryption.decrypt(record.line1);
            }
            if (typeof record.line2 === 'string') {
              record.line2 = this.encryption.decrypt(record.line2);
            }
            if (typeof record.city === 'string') {
              record.city = this.encryption.decrypt(record.city);
            }
            if (typeof record.postalCode === 'string') {
              record.postalCode = this.encryption.decrypt(record.postalCode);
            }
            return record;
          };

          if (Array.isArray(result)) {
            return result.map(decryptAddress);
          }

          return decryptAddress(result);
        }
      }

      return result;
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
