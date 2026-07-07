import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTransportTypeDto } from './create-transport-type.dto';

export class UpdateTransportTypeDto extends PartialType(CreateTransportTypeDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
