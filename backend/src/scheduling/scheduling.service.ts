import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, SalesOrderStatus, SchedulingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import { AuditService } from '../audit/audit.service';
import { DefineSchedulingDto } from './dto/define-scheduling.dto';
import { RescheduleDto } from './dto/reschedule.dto';
import { QuerySchedulingDto } from './dto/query-scheduling.dto';
import { buildPaginationMeta, Paginated } from '../common/pagination/paginate';
import type { Prisma } from '@prisma/client';

const SCHEDULING_INCLUDE = {
  salesOrder: { include: { customer: true, transportType: true } },
} as const;

type SchedulingWithRelations = Prisma.SchedulingGetPayload<{ include: typeof SCHEDULING_INCLUDE }>;

@Injectable()
export class SchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesOrdersService: SalesOrdersService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(filters: QuerySchedulingDto): Promise<Paginated<SchedulingWithRelations>> {
    const where = { status: filters.status };
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.scheduling.findMany({
        where,
        include: SCHEDULING_INCLUDE,
        orderBy: { deliveryDate: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.scheduling.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, pageSize) };
  }

  async findBySalesOrder(salesOrderId: string) {
    await this.salesOrdersService.findOne(salesOrderId);
    return this.prisma.scheduling.findUnique({ where: { salesOrderId }, include: SCHEDULING_INCLUDE });
  }

  async define(salesOrderId: string, dto: DefineSchedulingDto) {
    await this.salesOrdersService.findOne(salesOrderId);

    const existing = await this.prisma.scheduling.findUnique({ where: { salesOrderId } });

    return this.prisma.$transaction(async (tx) => {
      const scheduling = await tx.scheduling.upsert({
        where: { salesOrderId },
        create: {
          salesOrderId,
          deliveryDate: new Date(dto.deliveryDate),
          windowStart: dto.windowStart,
          windowEnd: dto.windowEnd,
          status: SchedulingStatus.PENDING,
        },
        update: {
          deliveryDate: new Date(dto.deliveryDate),
          windowStart: dto.windowStart,
          windowEnd: dto.windowEnd,
        },
        include: SCHEDULING_INCLUDE,
      });

      await this.auditService.record(
        {
          action: AuditAction.SCHEDULING_CHANGED,
          entity: 'Scheduling',
          entityId: scheduling.id,
          previousState: existing
            ? {
                deliveryDate: existing.deliveryDate,
                windowStart: existing.windowStart,
                windowEnd: existing.windowEnd,
                status: existing.status,
              }
            : null,
          newState: {
            deliveryDate: scheduling.deliveryDate,
            windowStart: scheduling.windowStart,
            windowEnd: scheduling.windowEnd,
            status: scheduling.status,
          },
        },
        tx,
      );

      return scheduling;
    });
  }

  async confirm(salesOrderId: string) {
    const existing = await this.getExistingOrThrow(salesOrderId);

    const scheduling = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.scheduling.update({
        where: { salesOrderId },
        data: { status: SchedulingStatus.CONFIRMED },
        include: SCHEDULING_INCLUDE,
      });

      await this.auditService.record(
        {
          action: AuditAction.SCHEDULING_CHANGED,
          entity: 'Scheduling',
          entityId: updated.id,
          previousState: { status: existing.status },
          newState: { status: updated.status },
        },
        tx,
      );

      return updated;
    });

    // A confirmed scheduling is exactly what unlocks the SCHEDULED status (see SalesOrdersService.updateStatus),
    // so a PLANNED order can move forward on its own instead of requiring a separate manual transition.
    const salesOrder = await this.salesOrdersService.findOne(salesOrderId);
    if (salesOrder.status === SalesOrderStatus.PLANNED) {
      await this.salesOrdersService.updateStatus(salesOrderId, { status: SalesOrderStatus.SCHEDULED });
    }

    return scheduling;
  }

  async reschedule(salesOrderId: string, dto: RescheduleDto) {
    const existing = await this.getExistingOrThrow(salesOrderId);

    return this.prisma.$transaction(async (tx) => {
      const scheduling = await tx.scheduling.update({
        where: { salesOrderId },
        data: {
          deliveryDate: new Date(dto.deliveryDate),
          windowStart: dto.windowStart,
          windowEnd: dto.windowEnd,
          status: SchedulingStatus.RESCHEDULED,
        },
        include: SCHEDULING_INCLUDE,
      });

      await this.auditService.record(
        {
          action: AuditAction.SCHEDULING_CHANGED,
          entity: 'Scheduling',
          entityId: scheduling.id,
          previousState: {
            deliveryDate: existing.deliveryDate,
            windowStart: existing.windowStart,
            windowEnd: existing.windowEnd,
            status: existing.status,
          },
          newState: {
            deliveryDate: scheduling.deliveryDate,
            windowStart: scheduling.windowStart,
            windowEnd: scheduling.windowEnd,
            status: scheduling.status,
          },
        },
        tx,
      );

      return scheduling;
    });
  }

  private async getExistingOrThrow(salesOrderId: string) {
    const existing = await this.prisma.scheduling.findUnique({ where: { salesOrderId } });
    if (!existing) {
      throw new NotFoundException(`No scheduling defined yet for sales order ${salesOrderId}.`);
    }
    return existing;
  }
}
