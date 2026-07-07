import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { SalesOrderItemDto } from './sales-order-item.dto';

export class CreateSalesOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID('4')
  customerId: string;

  @ApiProperty({ description: 'Transport type ID, must be authorized for the customer' })
  @IsUUID('4')
  transportTypeId: string;

  @ApiProperty({ type: [SalesOrderItemDto], description: 'Sales order items (at least one)' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  items: SalesOrderItemDto[];
}
