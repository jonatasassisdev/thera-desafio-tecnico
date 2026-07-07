import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'SKU-00123' })
  @IsString()
  @MinLength(2)
  sku: string;

  @ApiProperty({ example: 'Galvanized steel sheet 2mm' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: '1000x2000mm sheet, galvanized finish' })
  @IsOptional()
  @IsString()
  description?: string;
}
