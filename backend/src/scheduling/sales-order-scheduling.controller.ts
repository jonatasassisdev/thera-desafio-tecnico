import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service';
import { DefineSchedulingDto } from './dto/define-scheduling.dto';
import { RescheduleDto } from './dto/reschedule.dto';

@ApiTags('Scheduling')
@Controller('sales-orders/:salesOrderId/scheduling')
export class SalesOrderSchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Get()
  findOne(@Param('salesOrderId', ParseUUIDPipe) salesOrderId: string) {
    return this.schedulingService.findBySalesOrder(salesOrderId);
  }

  @Put()
  define(@Param('salesOrderId', ParseUUIDPipe) salesOrderId: string, @Body() dto: DefineSchedulingDto) {
    return this.schedulingService.define(salesOrderId, dto);
  }

  @Post('confirm')
  confirm(@Param('salesOrderId', ParseUUIDPipe) salesOrderId: string) {
    return this.schedulingService.confirm(salesOrderId);
  }

  @Post('reschedule')
  reschedule(@Param('salesOrderId', ParseUUIDPipe) salesOrderId: string, @Body() dto: RescheduleDto) {
    return this.schedulingService.reschedule(salesOrderId, dto);
  }
}
