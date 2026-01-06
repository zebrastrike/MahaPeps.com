import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ComplianceViolation = {
  term: string;
  severity: string;
  category: string;
};

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async scanContent(text: string): Promise<{
    violations: ComplianceViolation[];
    isCompliant: boolean;
  }> {
    const terms = await this.prisma.forbiddenTerm.findMany({
      where: { active: true },
    });

    const violations: ComplianceViolation[] = [];

    for (const term of terms) {
      const escaped = term.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

      if (regex.test(text)) {
        violations.push({
          term: term.term,
          severity: term.severity,
          category: term.category,
        });
      }
    }

    return {
      violations,
      isCompliant: violations.length === 0,
    };
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
