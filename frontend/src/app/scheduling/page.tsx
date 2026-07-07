"use client";

import { Fragment, useState } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { SelectInput } from "@/components/ui/select-input";
import { EmptyState, Spinner } from "@/components/ui/empty-state";
import { OrderStatusBadge, SchedulingStatusBadge } from "@/components/ui/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { SchedulingPanel } from "@/components/scheduling/scheduling-panel";
import { useSalesOrdersQuery } from "@/hooks/use-sales-orders";
import { SALES_ORDER_STATUS_LABELS } from "@/lib/status-labels";
import type { SalesOrderStatus } from "@/lib/types";

const RELEVANT_STATUSES: SalesOrderStatus[] = ["PLANNED", "SCHEDULED", "IN_TRANSIT"];
const PAGE_SIZE = 10;

export default function SchedulingCenterPage() {
  const [statusFilter, setStatusFilter] = useState<SalesOrderStatus | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: result, isLoading } = useSalesOrdersQuery({ status: statusFilter, page, pageSize: PAGE_SIZE });

  const orders = result?.data ?? [];
  const meta = result?.meta;

  return (
    <div>
      <PageHeader
        eyebrow="Operações"
        title="Central de Agendamento"
        description="Defina datas de entrega e janelas de atendimento, confirme e reagende entregas para Ordens de Venda planejadas."
      />

      <Card className="mb-6">
        <div className="p-5">
          <SelectInput
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as SalesOrderStatus | "");
              setPage(1);
            }}
            options={RELEVANT_STATUSES.map((status) => ({ value: status, label: SALES_ORDER_STATUS_LABELS[status] }))}
            placeholder="Todos os status"
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nada para agendar"
            description="As ordens aparecem aqui assim que saem do status CRIADA."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Status da ordem</th>
                  <th className="px-5 py-3 font-medium">Data de entrega</th>
                  <th className="px-5 py-3 font-medium">Agendamento</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <Fragment key={order.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="cursor-pointer border-b border-line-soft transition-colors hover:bg-raised"
                    >
                      <td className="mono-tabular whitespace-nowrap px-5 py-3 text-text-secondary">#{order.number}</td>
                      <td className="px-5 py-3 text-text-primary">{order.customer.name}</td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="mono-tabular whitespace-nowrap px-5 py-3 text-text-secondary">
                        {order.scheduling ? new Date(order.scheduling.deliveryDate).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        {order.scheduling ? (
                          <SchedulingStatusBadge status={order.scheduling.status} />
                        ) : (
                          <span className="text-xs text-text-muted">Não definido</span>
                        )}
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr className="border-b border-line-soft bg-inset">
                        <td colSpan={5} className="p-0">
                          <SchedulingPanel salesOrderId={order.id} scheduling={order.scheduling} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta && <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
