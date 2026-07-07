import { ApiPropertyOptional } from '@nestjs/swagger';
import { SalesOrderStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QuerySalesOrdersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SalesOrderStatus })
  @IsOptional()
  @IsEnum(SalesOrderStatus)
  status?: SalesOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  transportTypeId?: string;

  @ApiPropertyOptional({ description: 'Start of createdAt range (ISO date)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End of createdAt range (ISO date)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
