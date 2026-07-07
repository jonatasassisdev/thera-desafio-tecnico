import { Module } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';
import { CustomersModule } from '../customers/customers.module';
import { TransportTypesModule } from '../transport-types/transport-types.module';
import { ItemsModule } from '../items/items.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [CustomersModule, TransportTypesModule, ItemsModule, AuditModule],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
