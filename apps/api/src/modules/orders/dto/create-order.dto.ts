import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsISO31661Alpha2,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderAddressDto {
  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsISO31661Alpha2()
  @Length(2, 2)
  country: string;
}

export class OrderItemInputDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantity: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;
}

export class ComplianceAcknowledgmentDto {
  @IsBoolean()
  researchPurposeOnly: boolean;

  @IsBoolean()
  responsibilityAccepted: boolean;

  @IsBoolean()
  noMedicalAdvice: boolean;

  @IsBoolean()
  ageConfirmation: boolean;

  @IsBoolean()
  termsAccepted: boolean;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @ValidateNested()
  @Type(() => OrderAddressDto)
  shippingAddress: OrderAddressDto;

  @ValidateNested()
  @Type(() => OrderAddressDto)
  billingAddress: OrderAddressDto;

  @ValidateNested()
  @Type(() => ComplianceAcknowledgmentDto)
  compliance: ComplianceAcknowledgmentDto;
}

export class MarkOrderPaidDto {
  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  transactionReference?: string;

  @IsOptional()
  @IsString()
  paymentProof?: string;
}
