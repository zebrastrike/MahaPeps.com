import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

type ComplianceViolation = {
  term: string;
  severity: string;
  category: string | null;
  replacement?: string | null;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class ComplianceService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async scanContent(text: string): Promise<{
    violations: ComplianceViolation[];
    isCompliant: boolean;
  }> {
    const terms = await this.prisma.forbiddenTerm.findMany({
      where: { active: true },
    });

    const violations: ComplianceViolation[] = [];
    const normalizedText = text.toLowerCase();

    for (const term of terms) {
      const escaped = escapeRegExp(term.term.toLowerCase());
      const regex = term.term.includes(' ')
        ? new RegExp(escaped, 'gi')
        : new RegExp(`\\b${escaped}\\b`, 'gi');

      if (regex.test(normalizedText)) {
        violations.push({
          term: term.term,
          severity: term.severity,
          category: term.category,
          replacement: term.replacement,
        });
      }
    }

    return {
      violations,
      isCompliant: violations.length === 0,
    };
  }

  async enforceCompliance(text: string, entityId?: string): Promise<void> {
    const result = await this.scanContent(text);

    if (!result.isCompliant) {
      await this.auditService.log({
        action: 'forbidden_term_violation',
        entityType: 'Product',
        entityId,
        metadata: { violations: result.violations },
      });

      throw new BadRequestException({
        message: 'Content contains forbidden terms and cannot be saved',
        hint: 'Please remove medical or measurement-related language.',
        violations: result.violations.map((violation) => ({
          severity: violation.severity,
          category: violation.category,
          replacement: violation.replacement,
        })),
      });
    }
  }

  async seedForbiddenTerms(): Promise<void> {
    const terms = [
      { term: 'supplement', severity: 'CRITICAL', category: 'medical' },
      { term: 'dietary supplement', severity: 'CRITICAL', category: 'medical' },
      { term: 'wellness', severity: 'CRITICAL', category: 'medical' },
      { term: 'health benefits', severity: 'CRITICAL', category: 'medical' },
      { term: 'treatment', severity: 'CRITICAL', category: 'medical' },
      { term: 'therapy', severity: 'CRITICAL', category: 'medical' },
      { term: 'dosage', severity: 'CRITICAL', category: 'dosing' },
      { term: 'dose', severity: 'CRITICAL', category: 'dosing' },
      { term: 'administration', severity: 'CRITICAL', category: 'dosing' },
      { term: 'for humans', severity: 'CRITICAL', category: 'medical' },
      { term: 'for patients', severity: 'CRITICAL', category: 'medical' },
      { term: 'improves', severity: 'HIGH', category: 'claims' },
      { term: 'treats', severity: 'HIGH', category: 'claims' },
      { term: 'cures', severity: 'HIGH', category: 'claims' },
      { term: 'prevents', severity: 'HIGH', category: 'claims' },
      { term: 'weight loss', severity: 'HIGH', category: 'claims' },
      { term: 'anti-aging', severity: 'HIGH', category: 'claims' },
    ];

    await this.prisma.forbiddenTerm.createMany({
      data: terms,
      skipDuplicates: true,
    });
  }
}
