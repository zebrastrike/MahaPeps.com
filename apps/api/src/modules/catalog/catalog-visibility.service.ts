import { Injectable } from '@nestjs/common';
import { CatalogType, KycStatus, ProductVisibility, User, UserRole } from '@prisma/client';

@Injectable()
export class CatalogVisibilityService {
  getVisibleProducts(user?: User | null): ProductVisibility[] {
    if (!user) {
      return [ProductVisibility.B2C_ONLY, ProductVisibility.BOTH];
    }

    if (user.role === UserRole.CLIENT) {
      return [ProductVisibility.B2C_ONLY, ProductVisibility.BOTH];
    }

    if (user.role === UserRole.CLINIC || user.role === UserRole.DISTRIBUTOR) {
      if (user.kycVerification?.status === KycStatus.APPROVED) {
        return [
          ProductVisibility.B2C_ONLY,
          ProductVisibility.B2B_ONLY,
          ProductVisibility.BOTH,
        ];
      }

      return [ProductVisibility.B2C_ONLY, ProductVisibility.BOTH];
    }

    if (user.role === UserRole.ADMIN) {
      return [
        ProductVisibility.B2C_ONLY,
        ProductVisibility.B2B_ONLY,
        ProductVisibility.BOTH,
      ];
    }

    return [ProductVisibility.B2C_ONLY, ProductVisibility.BOTH];
  }

  getCatalogType(user?: User | null): CatalogType {
    if (!user) return CatalogType.B2C_ONLY;

    if (user.role === UserRole.CLIENT) {
      return CatalogType.B2C_ONLY;
    }

    if (
      (user.role === UserRole.CLINIC || user.role === UserRole.DISTRIBUTOR) &&
      user.kycVerification?.status === KycStatus.APPROVED
    ) {
      return CatalogType.B2B_ONLY;
    }

    return CatalogType.B2C_ONLY;
  }
}
