import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service';
import { QuerySchedulingDto } from './dto/query-scheduling.dto';

@ApiTags('Scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Get()
  findAll(@Query() query: QuerySchedulingDto) {
    return this.schedulingService.findAll(query);
  }
}
