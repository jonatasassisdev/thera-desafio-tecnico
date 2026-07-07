"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SelectInput } from "@/components/ui/select-input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { DateInput } from "@/components/ui/date-input";
import { EmptyState, Spinner } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { useSalesOrdersQuery } from "@/hooks/use-sales-orders";
import { useCustomersQuery } from "@/hooks/use-customers";
import { useTransportTypesQuery } from "@/hooks/use-transport-types";
import type { SalesOrderStatus } from "@/lib/types";
import { SALES_ORDER_STATUS_LABELS } from "@/lib/status-labels";

const STATUS_OPTIONS: SalesOrderStatus[] = ["CREATED", "PLANNED", "SCHEDULED", "IN_TRANSIT", "DELIVERED"];
const PAGE_SIZE = 10;

export default function SalesOrdersPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SalesOrdersContent />
    </Suspense>
  );
}

function SalesOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => ({
      status: (searchParams.get("status") ?? "") as SalesOrderStatus | "",
      customerId: searchParams.get("customerId") ?? "",
      transportTypeId: searchParams.get("transportTypeId") ?? "",
      dateFrom: searchParams.get("dateFrom") ?? "",
      dateTo: searchParams.get("dateTo") ?? "",
    }),
    [searchParams],
  );

  const page = Number(searchParams.get("page") ?? "1") || 1;

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/sales-orders?${params.toString()}`);
    },
    [router, searchParams],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      router.push(`/sales-orders?${params.toString()}`);
    },
    [router, searchParams],
  );

  const { data: result, isLoading } = useSalesOrdersQuery({ ...filters, page, pageSize: PAGE_SIZE });
  const { data: customers } = useCustomersQuery();
  const { data: transportTypes } = useTransportTypesQuery();

  const orders = result?.data ?? [];
  const meta = result?.meta;

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const statusOptions = STATUS_OPTIONS.map((status) => ({ value: status, label: SALES_ORDER_STATUS_LABELS[status] }));
  const customerOptions = (customers ?? []).map((customer) => ({ value: customer.id, label: customer.name }));
  const transportTypeOptions = (transportTypes ?? []).map((transportType) => ({
    value: transportType.id,
    label: transportType.name,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Operações"
        title="Ordens de Venda"
        description="Gerencie o ciclo de vida completo das Ordens de Venda e monitore a operação com filtros por status, cliente, transporte e data."
        action={
          <Link href="/sales-orders/new">
            <Button icon={Plus}>Nova Ordem de Venda</Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-5">
          <SelectInput
            value={filters.status}
            onChange={(value) => setFilter("status", value)}
            options={statusOptions}
            placeholder="Todos os status"
          />

          <AutocompleteInput
            value={filters.customerId}
            onChange={(value) => setFilter("customerId", value)}
            options={customerOptions}
            placeholder="Todos os clientes"
            emptyMessage="Nenhum cliente encontrado."
          />

          <AutocompleteInput
            value={filters.transportTypeId}
            onChange={(value) => setFilter("transportTypeId", value)}
            options={transportTypeOptions}
            placeholder="Todos os transportes"
            emptyMessage="Nenhum tipo de transporte encontrado."
          />

          <DateInput
            value={filters.dateFrom}
            onChange={(value) => setFilter("dateFrom", value)}
            placeholder="Data inicial"
          />

          <DateInput value={filters.dateTo} onChange={(value) => setFilter("dateTo", value)} placeholder="Data final" />
        </div>
        {hasActiveFilters && (
          <div className="border-t border-line px-5 py-2">
            <button
              onClick={() => router.push("/sales-orders")}
              className="text-xs font-medium text-text-secondary underline decoration-dotted underline-offset-4 hover:text-accent"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </Card>

      <Card>
        {isLoading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <EmptyState title="Nenhuma Ordem de Venda encontrada" description="Tente ajustar os filtros ou crie uma nova ordem." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Transporte</th>
                  <th className="px-5 py-3 font-medium">Itens</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Criada em</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/sales-orders/${order.id}`)}
                    className="cursor-pointer border-b border-line-soft transition-colors hover:bg-raised"
                  >
                    <td className="mono-tabular px-5 py-3 text-text-secondary">#{order.number}</td>
                    <td className="px-5 py-3 text-text-primary">{order.customer.name}</td>
                    <td className="px-5 py-3 text-text-secondary">{order.transportType.name}</td>
                    <td className="mono-tabular px-5 py-3 text-text-secondary">{order.items.length}</td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="mono-tabular px-5 py-3 text-text-muted">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
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
