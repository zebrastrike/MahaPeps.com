import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  DocumentReviewStatus,
  DocumentType,
  KycStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FileStorageService } from '../files/file-storage.service';
import { AuditService } from '../../audit/audit.service';

const MAX_KYC_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
    private readonly auditService: AuditService,
  ) {}

  async submitKyc(
    userId: string,
    files: Record<string, Express.Multer.File[]>,
  ) {
    const existing = await this.prisma.kycVerification.findUnique({
      where: { userId },
      include: { documents: true },
    });

    if (existing?.status === KycStatus.PENDING) {
      throw new BadRequestException('KYC submission already pending');
    }

    if (existing?.status === KycStatus.APPROVED) {
      throw new BadRequestException('KYC already approved');
    }

    if (
      existing?.status === KycStatus.REJECTED &&
      existing.canResubmitAt &&
      existing.canResubmitAt > new Date()
    ) {
      throw new BadRequestException('KYC resubmission not available yet');
    }

    const requiredFields = ['businessLicense', 'taxId', 'officerId'];
    for (const field of requiredFields) {
      if (!files[field]?.length) {
        throw new BadRequestException(`Missing required document: ${field}`);
      }
    }

    const documentMap: Array<{ field: string; type: DocumentType }> = [
      { field: 'businessLicense', type: DocumentType.BUSINESS_LICENSE },
      { field: 'taxId', type: DocumentType.TAX_ID },
      { field: 'officerId', type: DocumentType.OFFICER_ID },
      { field: 'facilityLicense', type: DocumentType.FACILITY_LICENSE },
      { field: 'addressProof', type: DocumentType.ADDRESS_PROOF },
    ];

    const uploadedDocuments: Array<{
      type: DocumentType;
      file: Express.Multer.File;
    }> = [];

    for (const entry of documentMap) {
      const file = files[entry.field]?.[0];
      if (!file) continue;
      this.validateFile(file);
      uploadedDocuments.push({ type: entry.type, file });
    }

    let verificationId = existing?.id;

    if (existing) {
      await this.prisma.kycDocument.deleteMany({
        where: { verificationId: existing.id },
      });

      const updated = await this.prisma.kycVerification.update({
        where: { id: existing.id },
        data: {
          status: KycStatus.PENDING,
          submittedAt: new Date(),
          approvedAt: null,
          approvedBy: null,
          rejectedAt: null,
          rejectionReason: null,
          lastRejectionAt: null,
          canResubmitAt: null,
          internalNotes: null,
        },
      });
      verificationId = updated.id;
    } else {
      const created = await this.prisma.kycVerification.create({
        data: {
          userId,
          status: KycStatus.PENDING,
          submittedAt: new Date(),
        },
      });
      verificationId = created.id;
    }

    const documents = await Promise.all(
      uploadedDocuments.map(async ({ type, file }) => {
        const fileRecord = await this.fileStorage.uploadFile(file, {
          bucket: 'kyc',
          uploadedBy: userId,
          prefix: `kyc/${userId}`,
        });

        return this.prisma.kycDocument.create({
          data: {
            verificationId: verificationId as string,
            documentType: type,
            fileId: fileRecord.id,
            status: DocumentReviewStatus.PENDING,
          },
        });
      }),
    );

    await this.auditService.log({
      userId,
      action: 'KYC_SUBMITTED',
      entityType: 'KycVerification',
      entityId: verificationId,
    });

    return {
      kycId: verificationId,
      status: KycStatus.PENDING,
      documents: documents.length,
    };
  }

  async getStatus(userId: string) {
    const verification = await this.prisma.kycVerification.findUnique({
      where: { userId },
      include: {
        documents: true,
      },
    });

    if (!verification) {
      return { status: KycStatus.NOT_SUBMITTED };
    }

    return {
      id: verification.id,
      status: verification.status,
      submittedAt: verification.submittedAt,
      approvedAt: verification.approvedAt,
      rejectedAt: verification.rejectedAt,
      rejectionReason: verification.rejectionReason,
      canResubmitAt: verification.canResubmitAt,
      documents: verification.documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        status: doc.status,
        reviewedAt: doc.reviewedAt,
        rejectionReason: doc.rejectionReason,
      })),
    };
  }

  async listForAdmin(status?: KycStatus) {
    const where = status ? { status } : {};
    const records = await this.prisma.kycVerification.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, role: true } },
        documents: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    return records.map((record) => ({
      id: record.id,
      userId: record.userId,
      userEmail: record.user?.email,
      userRole: record.user?.role,
      status: record.status,
      submittedAt: record.submittedAt,
      reviewedAt: record.reviewedAt,
      canResubmitAt: record.canResubmitAt,
      documentCount: record.documents.length,
    }));
  }

  async getForAdmin(kycId: string) {
    const verification = await this.prisma.kycVerification.findUnique({
      where: { id: kycId },
      include: {
        user: { select: { id: true, email: true, role: true } },
        documents: true,
      },
    });

    if (!verification) {
      throw new NotFoundException('KYC record not found');
    }

    const documents = await Promise.all(
      verification.documents.map(async (doc) => {
        const downloadUrl = await this.fileStorage.getSignedDownloadUrl(
          doc.fileId,
          3600,
        );
        return {
          id: doc.id,
          documentType: doc.documentType,
          status: doc.status,
          reviewedAt: doc.reviewedAt,
          rejectionReason: doc.rejectionReason,
          downloadUrl,
        };
      }),
    );

    return {
      id: verification.id,
      userId: verification.userId,
      userEmail: verification.user?.email,
      userRole: verification.user?.role,
      status: verification.status,
      submittedAt: verification.submittedAt,
      reviewedAt: verification.reviewedAt,
      rejectionReason: verification.rejectionReason,
      internalNotes: verification.internalNotes,
      documents,
    };
  }

  async approveKyc(kycId: string, adminId: string) {
    const verification = await this.prisma.kycVerification.update({
      where: { id: kycId },
      data: {
        status: KycStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: adminId,
        reviewedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
        canResubmitAt: null,
      },
    });

    await this.auditService.log({
      adminId,
      action: 'KYC_APPROVED',
      entityType: 'KycVerification',
      entityId: verification.id,
    });

    return verification;
  }

  async rejectKyc(
    kycId: string,
    adminId: string,
    rejectionReason: string,
    internalNotes?: string,
  ) {
    const now = new Date();
    const canResubmitAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const verification = await this.prisma.kycVerification.update({
      where: { id: kycId },
      data: {
        status: KycStatus.REJECTED,
        rejectedAt: now,
        lastRejectionAt: now,
        canResubmitAt,
        rejectionReason,
        internalNotes: internalNotes ?? null,
        reviewedAt: now,
      },
    });

    await this.auditService.log({
      adminId,
      action: 'KYC_REJECTED',
      entityType: 'KycVerification',
      entityId: verification.id,
      metadata: { rejectionReason },
    });

    return verification;
  }

  async reviewDocument(
    documentId: string,
    status: DocumentReviewStatus,
    adminId: string,
    rejectionReason?: string,
  ) {
    const document = await this.prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectionReason: rejectionReason ?? null,
      },
    });

    await this.auditService.log({
      adminId,
      action: 'KYC_DOCUMENT_REVIEWED',
      entityType: 'KycDocument',
      entityId: document.id,
      metadata: { status },
    });

    return document;
  }

  private validateFile(file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported document type');
    }

    if (file.size > MAX_KYC_FILE_SIZE) {
      throw new BadRequestException('Document exceeds size limit');
    }
  }
}
