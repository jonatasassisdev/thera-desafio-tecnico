import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTransportTypeDto {
  @ApiProperty({ example: 'Flatbed Trailer' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Articulated vehicle for large-scale cargo' })
  @IsOptional()
  @IsString()
  description?: string;
}
