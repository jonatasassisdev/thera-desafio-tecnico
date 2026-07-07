import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Sales orders lifecycle (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.auditLog.deleteMany();
    await prisma.salesOrderItem.deleteMany();
    await prisma.scheduling.deleteMany();
    await prisma.salesOrder.deleteMany();
    await prisma.customerTransportType.deleteMany();
    await prisma.item.deleteMany();
    await prisma.transportType.deleteMany();
    await prisma.customer.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('enforces authorized transport, the status state machine and confirmed scheduling before delivery', async () => {
    const authorizedTransport = await request(app.getHttpServer())
      .post('/transport-types')
      .send({ name: 'Truck' })
      .expect(201);

    const unauthorizedTransport = await request(app.getHttpServer())
      .post('/transport-types')
      .send({ name: 'Flatbed Trailer' })
      .expect(201);

    const customer = await request(app.getHttpServer())
      .post('/customers')
      .send({
        name: 'Acme Corp',
        document: '12345678000190',
        authorizedTransportTypeIds: [authorizedTransport.body.id],
      })
      .expect(201);

    const item = await request(app.getHttpServer())
      .post('/items')
      .send({ sku: 'SKU-1', name: 'Steel Sheet' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/sales-orders')
      .send({
        customerId: customer.body.id,
        transportTypeId: unauthorizedTransport.body.id,
        items: [{ itemId: item.body.id, quantity: 5 }],
      })
      .expect(422);

    const salesOrder = await request(app.getHttpServer())
      .post('/sales-orders')
      .send({
        customerId: customer.body.id,
        transportTypeId: authorizedTransport.body.id,
        items: [{ itemId: item.body.id, quantity: 5 }],
      })
      .expect(201);

    const salesOrderId = salesOrder.body.id;
    expect(salesOrder.body.status).toBe('CREATED');

    await request(app.getHttpServer())
      .patch(`/sales-orders/${salesOrderId}/status`)
      .send({ status: 'SCHEDULED' })
      .expect(422);

    await request(app.getHttpServer())
      .patch(`/sales-orders/${salesOrderId}/status`)
      .send({ status: 'PLANNED' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/sales-orders/${salesOrderId}/status`)
      .send({ status: 'SCHEDULED' })
      .expect(422);

    await request(app.getHttpServer())
      .put(`/sales-orders/${salesOrderId}/scheduling`)
      .send({ deliveryDate: '2026-07-20', windowStart: '08:00', windowEnd: '12:00' })
      .expect(200);

    // Confirming the scheduling is what unlocks SCHEDULED, so the order advances on its own —
    // no separate manual status transition is needed here.
    await request(app.getHttpServer())
      .post(`/sales-orders/${salesOrderId}/scheduling/confirm`)
      .expect(201);

    const scheduled = await request(app.getHttpServer()).get(`/sales-orders/${salesOrderId}`).expect(200);
    expect(scheduled.body.status).toBe('SCHEDULED');

    const auditTrail = await request(app.getHttpServer())
      .get(`/audit-logs/SalesOrder/${salesOrderId}`)
      .expect(200);

    const actions = auditTrail.body.map((entry: { action: string }) => entry.action);
    expect(actions).toEqual(
      expect.arrayContaining(['SALES_ORDER_CREATED', 'STATUS_CHANGED']),
    );
  });
});
