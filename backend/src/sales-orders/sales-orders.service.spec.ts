import { Test } from '@nestjs/testing';
import { SalesOrderStatus } from '@prisma/client';
import { SalesOrdersService } from './sales-orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { TransportTypesService } from '../transport-types/transport-types.service';
import { ItemsService } from '../items/items.service';
import { AuditService } from '../audit/audit.service';
import { TransportNotAuthorizedException, SchedulingNotConfirmedException } from './domain/sales-orders.exceptions';

describe('SalesOrdersService', () => {
  let service: SalesOrdersService;
  let prisma: { salesOrder: { findUnique: jest.Mock; create: jest.Mock }; $transaction: jest.Mock };
  let customersService: { findOne: jest.Mock; isTransportAuthorized: jest.Mock };
  let transportTypesService: { findOne: jest.Mock };
  let itemsService: { findManyByIds: jest.Mock };
  let auditService: { record: jest.Mock };

  beforeEach(async () => {
    prisma = {
      salesOrder: { findUnique: jest.fn(), create: jest.fn() },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
    };
    customersService = { findOne: jest.fn(), isTransportAuthorized: jest.fn() };
    transportTypesService = { findOne: jest.fn() };
    itemsService = { findManyByIds: jest.fn() };
    auditService = { record: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SalesOrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: CustomersService, useValue: customersService },
        { provide: TransportTypesService, useValue: transportTypesService },
        { provide: ItemsService, useValue: itemsService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = moduleRef.get(SalesOrdersService);
  });

  describe('create', () => {
    it('rejects a sales order when the transport type is not authorized for the customer', async () => {
      customersService.findOne.mockResolvedValue({ id: 'customer-1' });
      transportTypesService.findOne.mockResolvedValue({ id: 'transport-1' });
      customersService.isTransportAuthorized.mockResolvedValue(false);

      await expect(
        service.create({
          customerId: 'customer-1',
          transportTypeId: 'transport-1',
          items: [{ itemId: 'item-1', quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(TransportNotAuthorizedException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('creates the sales order when the transport type is authorized and items exist', async () => {
      customersService.findOne.mockResolvedValue({ id: 'customer-1' });
      transportTypesService.findOne.mockResolvedValue({ id: 'transport-1' });
      customersService.isTransportAuthorized.mockResolvedValue(true);
      itemsService.findManyByIds.mockResolvedValue([{ id: 'item-1' }]);
      prisma.salesOrder.create.mockResolvedValue({
        id: 'order-1',
        status: SalesOrderStatus.CREATED,
        customerId: 'customer-1',
        transportTypeId: 'transport-1',
        customer: { name: 'Acme Corp' },
        transportType: { name: 'Truck' },
      });

      const result = await service.create({
        customerId: 'customer-1',
        transportTypeId: 'transport-1',
        items: [{ itemId: 'item-1', quantity: 1 }],
      });

      expect(result.id).toBe('order-1');
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SALES_ORDER_CREATED', entity: 'SalesOrder', entityId: 'order-1' }),
        expect.anything(),
      );
    });
  });

  describe('updateStatus', () => {
    it('rejects moving to SCHEDULED without a confirmed scheduling', async () => {
      prisma.salesOrder.findUnique.mockResolvedValue({
        id: 'order-1',
        status: SalesOrderStatus.PLANNED,
        scheduling: { status: 'PENDING' },
      });

      await expect(service.updateStatus('order-1', { status: SalesOrderStatus.SCHEDULED })).rejects.toBeInstanceOf(
        SchedulingNotConfirmedException,
      );
    });
  });
});
