import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderStatusDto } from './dto/update-sales-order-status.dto';
import { UpdateSalesOrderTransportDto } from './dto/update-sales-order-transport.dto';
import { QuerySalesOrdersDto } from './dto/query-sales-orders.dto';

@ApiTags('Sales Orders')
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  create(@Body() dto: CreateSalesOrderDto) {
    return this.salesOrdersService.create(dto);
  }

  @Get()
  findAll(@Query() query: QuerySalesOrdersDto) {
    return this.salesOrdersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesOrdersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSalesOrderStatusDto) {
    return this.salesOrdersService.updateStatus(id, dto);
  }

  @Patch(':id/transport')
  updateTransport(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSalesOrderTransportDto) {
    return this.salesOrdersService.updateTransport(id, dto);
  }
}
