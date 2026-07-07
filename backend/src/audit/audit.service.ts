import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface RecordAuditParams {
  action: AuditAction;
  entity: string;
  entityId: string;
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(params: RecordAuditParams, tx: Prisma.TransactionClient | PrismaService = this.prisma) {
    return tx.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        previousState: (params.previousState ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        newState: (params.newState ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
  }

  findByEntity(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { timestamp: 'desc' },
    });
  }

  findAll() {
    return this.prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 200 });
  }
}
