import { ConflictException, UnprocessableEntityException } from '@nestjs/common';

export class InvalidStatusTransitionException extends UnprocessableEntityException {
  constructor(current: string, next: string) {
    super(`Invalid status transition: ${current} -> ${next}.`);
  }
}

export class TransportNotAuthorizedException extends UnprocessableEntityException {
  constructor(customerId: string, transportTypeId: string) {
    super(`Transport type ${transportTypeId} is not authorized for customer ${customerId}.`);
  }
}

export class SchedulingNotConfirmedException extends UnprocessableEntityException {
  constructor() {
    super('The sales order cannot move to SCHEDULED without a confirmed scheduling.');
  }
}

export class TransportNotChangeableException extends ConflictException {
  constructor(currentStatus: string) {
    super(`Transport type cannot be changed while the sales order is in status ${currentStatus}.`);
  }
}
