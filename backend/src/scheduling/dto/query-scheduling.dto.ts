import { ApiPropertyOptional } from '@nestjs/swagger';
import { SchedulingStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QuerySchedulingDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SchedulingStatus })
  @IsOptional()
  @IsEnum(SchedulingStatus)
  status?: SchedulingStatus;
}
