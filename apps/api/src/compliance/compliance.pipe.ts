import { Injectable, PipeTransform } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Injectable()
export class ComplianceValidationPipe implements PipeTransform {
  constructor(private complianceService: ComplianceService) {}

  async transform(value: unknown) {
    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);

      for (const [, fieldValue] of entries) {
        if (typeof fieldValue === 'string') {
          await this.complianceService.enforceCompliance(fieldValue);
        }
      }
    }

    return value;
  }
}
