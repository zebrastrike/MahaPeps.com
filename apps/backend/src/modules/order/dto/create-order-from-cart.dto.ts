import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, ValidateNested, IsArray, ArrayMinSize, IsNumber, Min, IsISO31661Alpha2, Length } from 'class-validator';
import { OrderAccountType } from '../entities/order.entity';

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

export class CreateOrderFromCartDto {
  @IsString()
  cartId: string;

  @IsEnum(OrderAccountType)
  accountType: OrderAccountType;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @IsOptional()
  @IsUUID()
  distributorId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @ValidateNested()
  @Type(() => OrderAddressDto)
  shippingAddress: OrderAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderAddressDto)
  billingAddress?: OrderAddressDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
