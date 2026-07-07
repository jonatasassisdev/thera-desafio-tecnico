import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, Prisma, SalesOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { TransportTypesService } from '../transport-types/transport-types.service';
import { ItemsService } from '../items/items.service';
import { AuditService } from '../audit/audit.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderStatusDto } from './dto/update-sales-order-status.dto';
import { UpdateSalesOrderTransportDto } from './dto/update-sales-order-transport.dto';
import { QuerySalesOrdersDto } from './dto/query-sales-orders.dto';
import { SalesOrderStateMachine } from './domain/sales-order-status.state-machine';
import {
  SchedulingNotConfirmedException,
  TransportNotAuthorizedException,
  TransportNotChangeableException,
} from './domain/sales-orders.exceptions';
import { buildPaginationMeta, Paginated } from '../common/pagination/paginate';

const SALES_ORDER_INCLUDE = {
  customer: true,
  transportType: true,
  items: { include: { item: true } },
  scheduling: true,
} as const;

type SalesOrderWithRelations = Prisma.SalesOrderGetPayload<{ include: typeof SALES_ORDER_INCLUDE }>;

const TRANSPORT_CHANGEABLE_STATUSES: SalesOrderStatus[] = [SalesOrderStatus.CREATED, SalesOrderStatus.PLANNED];

@Injectable()
export class SalesOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
    private readonly transportTypesService: TransportTypesService,
    private readonly itemsService: ItemsService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateSalesOrderDto) {
    await this.customersService.findOne(dto.customerId);
    await this.transportTypesService.findOne(dto.transportTypeId);

    const authorized = await this.customersService.isTransportAuthorized(dto.customerId, dto.transportTypeId);
    if (!authorized) {
      throw new TransportNotAuthorizedException(dto.customerId, dto.transportTypeId);
    }

    const itemIds = dto.items.map((entry) => entry.itemId);
    const uniqueItemIds = new Set(itemIds);
    if (uniqueItemIds.size !== itemIds.length) {
      throw new BadRequestException('Duplicate items are not allowed in the same sales order.');
    }

    const foundItems = await this.itemsService.findManyByIds(itemIds);
    if (foundItems.length !== uniqueItemIds.size) {
      const foundIds = new Set(foundItems.map((item) => item.id));
      const missing = itemIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Item(s) not found: ${missing.join(', ')}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const salesOrder = await tx.salesOrder.create({
        data: {
          customerId: dto.customerId,
          transportTypeId: dto.transportTypeId,
          items: {
            create: dto.items.map((entry) => ({ itemId: entry.itemId, quantity: entry.quantity })),
          },
        },
        include: SALES_ORDER_INCLUDE,
      });

      await this.auditService.record(
        {
          action: AuditAction.SALES_ORDER_CREATED,
          entity: 'SalesOrder',
          entityId: salesOrder.id,
          newState: {
            status: salesOrder.status,
            customer: { id: salesOrder.customerId, name: salesOrder.customer.name },
            transportType: { id: salesOrder.transportTypeId, name: salesOrder.transportType.name },
          },
        },
        tx,
      );

      return salesOrder;
    });
  }

  async findAll(filters: QuerySalesOrdersDto): Promise<Paginated<SalesOrderWithRelations>> {
    const where: Prisma.SalesOrderWhereInput = {
      status: filters.status,
      customerId: filters.customerId,
      transportTypeId: filters.transportTypeId,
    };

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
      };
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.salesOrder.findMany({
        where,
        include: SALES_ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, pageSize) };
  }

  async findOne(id: string) {
    const salesOrder = await this.prisma.salesOrder.findUnique({ where: { id }, include: SALES_ORDER_INCLUDE });
    if (!salesOrder) {
      throw new NotFoundException(`Sales order ${id} not found.`);
    }
    return salesOrder;
  }

  async updateStatus(id: string, dto: UpdateSalesOrderStatusDto) {
    const salesOrder = await this.findOne(id);

    SalesOrderStateMachine.validateTransition(salesOrder.status, dto.status);

    if (dto.status === SalesOrderStatus.SCHEDULED && salesOrder.scheduling?.status !== 'CONFIRMED') {
      throw new SchedulingNotConfirmedException();
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.salesOrder.update({
        where: { id },
        data: { status: dto.status },
        include: SALES_ORDER_INCLUDE,
      });

      await this.auditService.record(
        {
          action: AuditAction.STATUS_CHANGED,
          entity: 'SalesOrder',
          entityId: id,
          previousState: { status: salesOrder.status },
          newState: { status: updated.status },
        },
        tx,
      );

      return updated;
    });
  }

  async updateTransport(id: string, dto: UpdateSalesOrderTransportDto) {
    const salesOrder = await this.findOne(id);

    if (!TRANSPORT_CHANGEABLE_STATUSES.includes(salesOrder.status)) {
      throw new TransportNotChangeableException(salesOrder.status);
    }

    await this.transportTypesService.findOne(dto.transportTypeId);

    const authorized = await this.customersService.isTransportAuthorized(salesOrder.customerId, dto.transportTypeId);
    if (!authorized) {
      throw new TransportNotAuthorizedException(salesOrder.customerId, dto.transportTypeId);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.salesOrder.update({
        where: { id },
        data: { transportTypeId: dto.transportTypeId },
        include: SALES_ORDER_INCLUDE,
      });

      await this.auditService.record(
        {
          action: AuditAction.TRANSPORT_CHANGED,
          entity: 'SalesOrder',
          entityId: id,
          previousState: { transportType: { id: salesOrder.transportTypeId, name: salesOrder.transportType.name } },
          newState: { transportType: { id: updated.transportTypeId, name: updated.transportType.name } },
        },
        tx,
      );

      return updated;
    });
  }
}
