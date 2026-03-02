import { IsString, IsEmail, IsArray, IsOptional, IsNotEmpty, ValidateNested, IsBoolean, IsNumber, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

class CustomizationDto {
  @IsBoolean()
  @IsOptional()
  allowEmbroidery?: boolean;

  @IsString()
  @IsOptional()
  embroideryText?: string;

  @IsString()
  @IsOptional()
  customColor?: string;

  @IsString()
  @IsOptional()
  instructions?: string;
}

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomizationDto)
  customization?: any; // Using any for flexibilty in snapshotting
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEmail()
  email: string;

  @IsBoolean()
  @IsOptional()
  isCustomOrder?: boolean;

  @ValidateIf(o => o.isCustomOrder === true)
  @IsNotEmpty({ message: 'Phone number is mandatory for custom orders.' })
  @IsString()
  customerPhone?: string;

  @IsNotEmpty()
  shippingAddress: any; // { city, country, state, line1, etc. }

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  regionCode?: string;
}
