import { IsArray, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ type: [String], description: 'List of product IDs' })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @ApiProperty({ description: 'Order status', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Total price of the order' })
  @IsNumber()
  totalPrice: number;
} 