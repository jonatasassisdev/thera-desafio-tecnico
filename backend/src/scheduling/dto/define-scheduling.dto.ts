import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, Matches } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class DefineSchedulingDto {
  @ApiProperty({ example: '2026-07-15', description: 'Delivery date (ISO date)' })
  @IsDateString()
  deliveryDate: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'windowStart must be in HH:mm format' })
  windowStart: string;

  @ApiProperty({ example: '12:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'windowEnd must be in HH:mm format' })
  windowEnd: string;
}
