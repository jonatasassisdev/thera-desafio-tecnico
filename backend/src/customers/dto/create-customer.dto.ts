import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Green River Distribution Ltd' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsString()
  @MinLength(5)
  document: string;

  @ApiPropertyOptional({ example: 'contact@greenriver.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'IDs of the transport types authorized for this customer',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  authorizedTransportTypeIds?: string[];
}
