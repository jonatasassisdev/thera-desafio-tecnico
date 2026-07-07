import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransportTypeDto } from './dto/create-transport-type.dto';
import { UpdateTransportTypeDto } from './dto/update-transport-type.dto';

@Injectable()
export class TransportTypesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTransportTypeDto) {
    return this.prisma.transportType.create({ data: dto });
  }

  findAll() {
    return this.prisma.transportType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const transportType = await this.prisma.transportType.findUnique({ where: { id } });
    if (!transportType) {
      throw new NotFoundException(`Transport type ${id} not found.`);
    }
    return transportType;
  }

  async update(id: string, dto: UpdateTransportTypeDto) {
    await this.findOne(id);
    return this.prisma.transportType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.transportType.delete({ where: { id } });
  }
}
