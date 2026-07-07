import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { SalesOrderSchedulingController } from './sales-order-scheduling.controller';
import { SalesOrdersModule } from '../sales-orders/sales-orders.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SalesOrdersModule, AuditModule],
  controllers: [SchedulingController, SalesOrderSchedulingController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
