import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ViolationSeverity } from '@prisma/client';

interface ViolationMatch {
  term: string;
  severity: ViolationSeverity;
  category: string | null;
  replacement: string | null;
  context: string;
  fieldName: string;
}

interface ProductViolation {
  productId: string;
  productName: string;
  productSku: string;
  violations: ViolationMatch[];
  violationCount: number;
  highestSeverity: ViolationSeverity;
  isActive: boolean;
}

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Scan all products for forbidden terms
   */
  async scanAllProducts(): Promise<ProductViolation[]> {
    // Get all forbidden terms
    const forbiddenTerms = await this.prisma.forbiddenTerm.findMany({
      where: { active: true },
    });

    // Get all products
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        form: true,
        isActive: true,
      },
    });

    const productViolations: ProductViolation[] = [];

    for (const product of products) {
      const violations: ViolationMatch[] = [];

      // Check each field for violations
      const fieldsToCheck = {
        name: product.name,
        description: product.description || '',
        form: product.form || '',
      };

      for (const [fieldName, fieldValue] of Object.entries(fieldsToCheck)) {
        if (!fieldValue) continue;

        const fieldLower = fieldValue.toLowerCase();

        for (const forbiddenTerm of forbiddenTerms) {
          const termLower = forbiddenTerm.term.toLowerCase();

          if (fieldLower.includes(termLower)) {
            // Find context (30 chars before and after)
            const index = fieldLower.indexOf(termLower);
            const start = Math.max(0, index - 30);
            const end = Math.min(fieldValue.length, index + termLower.length + 30);
            const context = fieldValue.substring(start, end);

            violations.push({
              term: forbiddenTerm.term,
              severity: forbiddenTerm.severity,
              category: forbiddenTerm.category,
              replacement: forbiddenTerm.replacement,
              context: `...${context}...`,
              fieldName,
            });
          }
        }
      }

      if (violations.length > 0) {
        // Determine highest severity
        const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        const highestSeverity = violations.reduce((highest, v) => {
          return severityOrder.indexOf(v.severity) < severityOrder.indexOf(highest)
            ? v.severity
            : highest;
        }, 'LOW' as ViolationSeverity);

        productViolations.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          violations,
          violationCount: violations.length,
          highestSeverity,
          isActive: product.isActive,
        });
      }
    }

    // Sort by severity and count
    return productViolations.sort((a, b) => {
      const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      const aSeverityIndex = severityOrder.indexOf(a.highestSeverity);
      const bSeverityIndex = severityOrder.indexOf(b.highestSeverity);

      if (aSeverityIndex !== bSeverityIndex) {
        return aSeverityIndex - bSeverityIndex;
      }

      return b.violationCount - a.violationCount;
    });
  }

  /**
   * Scan a single product for violations
   */
  async scanProduct(productId: string): Promise<ProductViolation | null> {
    const allViolations = await this.scanAllProducts();
    return allViolations.find((v) => v.productId === productId) || null;
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats() {
    const violations = await this.scanAllProducts();

    const stats = {
      totalProducts: await this.prisma.product.count(),
      productsWithViolations: violations.length,
      criticalViolations: violations.filter((v) => v.highestSeverity === 'CRITICAL')
        .length,
      highViolations: violations.filter((v) => v.highestSeverity === 'HIGH').length,
      mediumViolations: violations.filter((v) => v.highestSeverity === 'MEDIUM').length,
      lowViolations: violations.filter((v) => v.highestSeverity === 'LOW').length,
      activeProductsWithViolations: violations.filter((v) => v.isActive).length,
    };

    return stats;
  }

  /**
   * Auto-fix suggestions (generate fixed text)
   */
  async getSuggestedFixes(productId: string) {
    const violation = await this.scanProduct(productId);
    if (!violation) {
      return null;
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return null;
    }

    const suggestions: Record<string, string> = {};

    // Generate fixed versions
    let fixedName = product.name;
    let fixedDescription = product.description || '';
    let fixedForm = product.form || '';

    for (const v of violation.violations) {
      if (v.replacement) {
        const regex = new RegExp(v.term, 'gi');

        if (v.fieldName === 'name') {
          fixedName = fixedName.replace(regex, v.replacement);
        } else if (v.fieldName === 'description') {
          fixedDescription = fixedDescription.replace(regex, v.replacement);
        } else if (v.fieldName === 'form') {
          fixedForm = fixedForm.replace(regex, v.replacement);
        }
      }
    }

    return {
      original: {
        name: product.name,
        description: product.description,
        form: product.form,
      },
      suggested: {
        name: fixedName !== product.name ? fixedName : null,
        description:
          fixedDescription !== product.description ? fixedDescription : null,
        form: fixedForm !== product.form ? fixedForm : null,
      },
    };
  }
}
