import { SalesOrderStatus } from '@prisma/client';
import { InvalidStatusTransitionException } from './sales-orders.exceptions';

export const SALES_ORDER_TRANSITIONS: Record<SalesOrderStatus, SalesOrderStatus[]> = {
  CREATED: [SalesOrderStatus.PLANNED],
  PLANNED: [SalesOrderStatus.SCHEDULED],
  SCHEDULED: [SalesOrderStatus.IN_TRANSIT],
  IN_TRANSIT: [SalesOrderStatus.DELIVERED],
  DELIVERED: [],
};

export class SalesOrderStateMachine {
  static canTransition(current: SalesOrderStatus, next: SalesOrderStatus): boolean {
    return SALES_ORDER_TRANSITIONS[current]?.includes(next) ?? false;
  }

  static validateTransition(current: SalesOrderStatus, next: SalesOrderStatus): void {
    if (!this.canTransition(current, next)) {
      throw new InvalidStatusTransitionException(current, next);
    }
  }
}
