import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransportTypesService } from './transport-types.service';
import { CreateTransportTypeDto } from './dto/create-transport-type.dto';
import { UpdateTransportTypeDto } from './dto/update-transport-type.dto';

@ApiTags('Transport Types')
@Controller('transport-types')
export class TransportTypesController {
  constructor(private readonly transportTypesService: TransportTypesService) {}

  @Post()
  create(@Body() dto: CreateTransportTypeDto) {
    return this.transportTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.transportTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transportTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTransportTypeDto) {
    return this.transportTypesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.transportTypesService.remove(id);
  }
}
