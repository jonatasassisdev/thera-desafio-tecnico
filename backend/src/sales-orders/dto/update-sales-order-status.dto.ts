import { ApiProperty } from '@nestjs/swagger';
import { SalesOrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateSalesOrderStatusDto {
  @ApiProperty({ enum: SalesOrderStatus, example: SalesOrderStatus.PLANNED })
  @IsEnum(SalesOrderStatus)
  status: SalesOrderStatus;
}
