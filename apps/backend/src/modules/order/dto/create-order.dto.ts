import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsString,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { OrderAddressDto, OrderItemInputDto } from './create-order-from-cart.dto';

/**
 * DTO for compliance acknowledgment during checkout
 * All 5 fields must be true per GUARDRAILS.md
 */
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

/**
 * DTO for creating a new order with compliance validation
 */
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

/**
 * DTO for marking an order as paid (admin only)
 */
export class MarkOrderPaidDto {
  @IsString()
  method: string; // "ZELLE", "CASHAPP", "WIRE_TRANSFER"

  @IsOptional()
  @IsString()
  transactionReference?: string; // Zelle confirmation / CashApp transaction ID

  @IsOptional()
  @IsString()
  paymentProof?: string; // URL to uploaded screenshot/receipt
}
