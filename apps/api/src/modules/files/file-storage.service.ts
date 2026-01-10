import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FileStorageService {
  private readonly s3Client: S3Client;

  constructor(private readonly prisma: PrismaService) {
    const required = [
      'R2_ENDPOINT',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_KYC_BUCKET',
      'R2_COA_BUCKET',
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`${key} environment variable is required`);
      }
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
      },
    });
  }

  private getBucketName(bucket: 'kyc' | 'coa') {
    return bucket === 'kyc'
      ? (process.env.R2_KYC_BUCKET as string)
      : (process.env.R2_COA_BUCKET as string);
  }

  async uploadFile(
    file: Express.Multer.File,
    options: {
      bucket: 'kyc' | 'coa';
      isPublic?: boolean;
      uploadedBy?: string;
      prefix?: string;
    },
  ) {
    const bucketName = this.getBucketName(options.bucket);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const prefix = options.prefix ? `${options.prefix.replace(/\/+$/, '')}/` : '';
    const storageKey = `${prefix}${Date.now()}-${safeName}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return this.prisma.file.create({
      data: {
        filename: storageKey,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        storageProvider: 'r2',
        storageBucket: bucketName,
        storageKey,
        uploadedBy: options.uploadedBy,
        isPublic: options.isPublic ?? false,
      },
    });
  }

  async getSignedDownloadUrl(fileId: string, expiresIn = 3600) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const command = new GetObjectCommand({
      Bucket: file.storageBucket,
      Key: file.storageKey,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(fileId: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: file.storageBucket,
        Key: file.storageKey,
      }),
    );

    await this.prisma.file.delete({ where: { id: fileId } });
  }
}
