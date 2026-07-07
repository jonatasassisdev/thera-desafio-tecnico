import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateSalesOrderTransportDto {
  @ApiProperty({ description: 'New transport type, must be authorized for the sales order customer' })
  @IsUUID('4')
  transportTypeId: string;
}
