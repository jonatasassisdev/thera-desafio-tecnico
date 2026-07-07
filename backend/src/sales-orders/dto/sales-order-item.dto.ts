import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class SalesOrderItemDto {
  @ApiProperty({ description: 'ID of a previously registered item' })
  @IsUUID('4')
  itemId: string;

  @ApiProperty({ example: 10, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
