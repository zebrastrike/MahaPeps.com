import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Injectable()
export class ComplianceValidationPipe implements PipeTransform {
  constructor(private complianceService: ComplianceService) {}

  async transform(value: unknown) {
    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);

      for (const [key, fieldValue] of entries) {
        if (typeof fieldValue === 'string') {
          const result = await this.complianceService.scanContent(fieldValue);

          if (!result.isCompliant) {
            throw new BadRequestException({
              message: 'Content contains forbidden terms',
              violations: result.violations,
              field: key,
            });
          }
        }
      }
    }

    return value;
  }
}
