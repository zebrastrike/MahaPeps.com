export class CreateStackDto {
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  focus?: string;
  imageUrl?: string;
  priceCents: number;
  savingsPercent?: number;
  isActive?: boolean;
  isPopular?: boolean;
  displayOrder?: number;
}

export class UpdateStackDto {
  name?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  focus?: string;
  imageUrl?: string;
  priceCents?: number;
  savingsPercent?: number;
  isActive?: boolean;
  isPopular?: boolean;
  displayOrder?: number;
}

export class AddStackItemDto {
  productId: string;
  role?: string;
  sortOrder?: number;
}
