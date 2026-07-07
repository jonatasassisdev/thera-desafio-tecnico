export type SalesOrderStatus = "CREATED" | "PLANNED" | "SCHEDULED" | "IN_TRANSIT" | "DELIVERED";

export type SchedulingStatus = "PENDING" | "CONFIRMED" | "RESCHEDULED";

export interface TransportType {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAuthorizedTransport {
  transportTypeId: string;
  transportType: TransportType;
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  authorizedTransportTypes: CustomerAuthorizedTransport[];
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderItem {
  id: string;
  itemId: string;
  quantity: number;
  item: Item;
}

export interface Scheduling {
  id: string;
  salesOrderId: string;
  deliveryDate: string;
  windowStart: string;
  windowEnd: string;
  status: SchedulingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulingWithOrder extends Scheduling {
  salesOrder: {
    id: string;
    number: number;
    status: SalesOrderStatus;
    customer: Customer;
    transportType: TransportType;
  };
}

export interface SalesOrder {
  id: string;
  number: number;
  status: SalesOrderStatus;
  customerId: string;
  transportTypeId: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  transportType: TransportType;
  items: SalesOrderItem[];
  scheduling: Scheduling | null;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  entityId: string;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}
