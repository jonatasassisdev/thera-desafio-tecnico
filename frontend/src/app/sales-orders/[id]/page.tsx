"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, PackageSearch, ScrollText } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { EmptyState, Spinner } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { SchedulingPanel } from "@/components/scheduling/scheduling-panel";
import {
  useSalesOrderAuditTrailQuery,
  useSalesOrderQuery,
  useUpdateSalesOrderStatusMutation,
  useUpdateSalesOrderTransportMutation,
} from "@/hooks/use-sales-orders";
import { useCustomerQuery } from "@/hooks/use-customers";
import { SALES_ORDER_TRANSITIONS, TRANSPORT_CHANGEABLE_STATUSES } from "@/lib/sales-order-transitions";
import { AUDIT_ACTION_LABELS, SALES_ORDER_STATUS_LABELS } from "@/lib/status-labels";
import { formatAuditEntry } from "@/lib/audit-format";
import type { SalesOrderStatus } from "@/lib/types";

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: order, isLoading } = useSalesOrderQuery(params.id);
  const { data: auditTrail } = useSalesOrderAuditTrailQuery(params.id);
  const { data: customer } = useCustomerQuery(order?.customerId);
  const updateStatus = useUpdateSalesOrderStatusMutation();
  const updateTransport = useUpdateSalesOrderTransportMutation();
  const [transportDraft, setTransportDraft] = useState("");

  if (isLoading) return <Spinner />;
  if (!order) return <EmptyState title="Ordem de Venda não encontrada" icon={PackageSearch} />;

  const nextStatuses = SALES_ORDER_TRANSITIONS[order.status];
  const canChangeTransport = TRANSPORT_CHANGEABLE_STATUSES.includes(order.status);
  const authorizedTransports = customer?.authorizedTransportTypes ?? [];
  const transportOptions = authorizedTransports
    .filter(({ transportTypeId }) => transportTypeId !== order.transportTypeId)
    .map(({ transportType }) => ({ value: transportType.id, label: transportType.name }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`Ordem #${order.number}`}
        title={order.customer.name}
        description={`Criada em ${new Date(order.createdAt).toLocaleString("pt-BR")}`}
        action={<OrderStatusBadge status={order.status} />}
      />

      <Card>
        <CardHeader title="Ciclo de vida" description="Apenas a próxima transição válida pode ser aplicada." />
        <div className="flex flex-wrap items-center gap-3 p-5">
          {nextStatuses.length === 0 ? (
            <span className="text-sm text-text-secondary">Esta ordem atingiu seu status final.</span>
          ) : (
            nextStatuses.map((status: SalesOrderStatus) => (
              <Button
                key={status}
                variant="secondary"
                icon={ArrowRight}
                loading={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: order.id, status })}
              >
                Avançar para {SALES_ORDER_STATUS_LABELS[status]}
              </Button>
            ))
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Transporte" />
          <div className="flex flex-col gap-3 p-5">
            <p className="text-sm text-text-primary">
              Atual: <span className="text-accent">{order.transportType.name}</span>
            </p>
            {canChangeTransport ? (
              <div className="flex gap-2">
                <AutocompleteInput
                  className="flex-1"
                  value={transportDraft}
                  onChange={setTransportDraft}
                  options={transportOptions}
                  placeholder="Alterar tipo de transporte"
                  emptyMessage="Nenhum outro tipo de transporte autorizado."
                />
                <Button
                  variant="secondary"
                  icon={Check}
                  disabled={!transportDraft}
                  loading={updateTransport.isPending}
                  onClick={() => {
                    updateTransport.mutate({ id: order.id, transportTypeId: transportDraft });
                    setTransportDraft("");
                  }}
                >
                  Aplicar
                </Button>
              </div>
            ) : (
              <p className="text-xs text-text-muted">O transporte não pode mais ser alterado nesta etapa.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Itens" />
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line-soft text-xs uppercase tracking-wider text-text-muted">
                <th className="px-5 py-2 font-medium">SKU</th>
                <th className="px-5 py-2 font-medium">Nome</th>
                <th className="px-5 py-2 font-medium">Qtd.</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((entry) => (
                <tr key={entry.id} className="border-b border-line-soft last:border-0">
                  <td className="mono-tabular px-5 py-2 text-text-secondary">{entry.item.sku}</td>
                  <td className="px-5 py-2 text-text-primary">{entry.item.name}</td>
                  <td className="mono-tabular px-5 py-2 text-text-secondary">{entry.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <CardHeader title="Agendamento" description="Data de entrega, janela de atendimento e confirmação." />
        <SchedulingPanel salesOrderId={order.id} scheduling={order.scheduling} />
      </Card>

      <Card>
        <CardHeader title="Trilha de auditoria" description="Rastreabilidade das alterações relevantes desta ordem." />
        {!auditTrail || auditTrail.length === 0 ? (
          <EmptyState title="Nenhum evento de auditoria ainda" icon={ScrollText} />
        ) : (
          <ul className="flex flex-col divide-y divide-line-soft">
            {auditTrail.map((entry) => {
              const { before, after } = formatAuditEntry(entry);
              return (
                <li key={entry.id} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-text-primary">{AUDIT_ACTION_LABELS[entry.action] ?? entry.action}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {before ? (
                        <>
                          {before} <span className="text-text-muted">→</span> {after}
                        </>
                      ) : (
                        after
                      )}
                    </p>
                  </div>
                  <span className="mono-tabular shrink-0 text-xs text-text-muted">
                    {new Date(entry.timestamp).toLocaleString("pt-BR")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
