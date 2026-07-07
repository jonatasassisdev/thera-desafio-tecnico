import { SalesOrderStatus } from '@prisma/client';
import { SalesOrderStateMachine } from './sales-order-status.state-machine';
import { InvalidStatusTransitionException } from './sales-orders.exceptions';

describe('SalesOrderStateMachine', () => {
  it.each([
    [SalesOrderStatus.CREATED, SalesOrderStatus.PLANNED],
    [SalesOrderStatus.PLANNED, SalesOrderStatus.SCHEDULED],
    [SalesOrderStatus.SCHEDULED, SalesOrderStatus.IN_TRANSIT],
    [SalesOrderStatus.IN_TRANSIT, SalesOrderStatus.DELIVERED],
  ])('allows %s -> %s', (current, next) => {
    expect(SalesOrderStateMachine.canTransition(current, next)).toBe(true);
    expect(() => SalesOrderStateMachine.validateTransition(current, next)).not.toThrow();
  });

  it.each([
    [SalesOrderStatus.CREATED, SalesOrderStatus.SCHEDULED],
    [SalesOrderStatus.CREATED, SalesOrderStatus.DELIVERED],
    [SalesOrderStatus.PLANNED, SalesOrderStatus.CREATED],
    [SalesOrderStatus.DELIVERED, SalesOrderStatus.CREATED],
    [SalesOrderStatus.IN_TRANSIT, SalesOrderStatus.PLANNED],
  ])('rejects %s -> %s', (current, next) => {
    expect(SalesOrderStateMachine.canTransition(current, next)).toBe(false);
    expect(() => SalesOrderStateMachine.validateTransition(current, next)).toThrow(
      InvalidStatusTransitionException,
    );
  });

  it('does not allow any transition out of DELIVERED', () => {
    Object.values(SalesOrderStatus).forEach((status) => {
      expect(SalesOrderStateMachine.canTransition(SalesOrderStatus.DELIVERED, status)).toBe(false);
    });
  });
});
