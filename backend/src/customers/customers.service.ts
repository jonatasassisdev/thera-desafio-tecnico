import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

const CUSTOMER_INCLUDE = {
  authorizedTransportTypes: { include: { transportType: true } },
} as const;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const { authorizedTransportTypeIds, ...data } = dto;

    return this.prisma.customer.create({
      data: {
        ...data,
        authorizedTransportTypes: authorizedTransportTypeIds?.length
          ? { create: authorizedTransportTypeIds.map((transportTypeId) => ({ transportTypeId })) }
          : undefined,
      },
      include: CUSTOMER_INCLUDE,
    });
  }

  findAll() {
    return this.prisma.customer.findMany({ include: CUSTOMER_INCLUDE, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, include: CUSTOMER_INCLUDE });
    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found.`);
    }
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const { authorizedTransportTypeIds, ...data } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (authorizedTransportTypeIds) {
        await tx.customerTransportType.deleteMany({ where: { customerId: id } });
        if (authorizedTransportTypeIds.length) {
          await tx.customerTransportType.createMany({
            data: authorizedTransportTypeIds.map((transportTypeId) => ({ customerId: id, transportTypeId })),
          });
        }
      }

      return tx.customer.update({
        where: { id },
        data,
        include: CUSTOMER_INCLUDE,
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
  }

  async isTransportAuthorized(customerId: string, transportTypeId: string): Promise<boolean> {
    const link = await this.prisma.customerTransportType.findUnique({
      where: { customerId_transportTypeId: { customerId, transportTypeId } },
    });
    return !!link;
  }
}
