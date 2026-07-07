import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salesOrdersApi, type CreateSalesOrderInput, type SalesOrderFilters } from "@/lib/api/sales-orders";
import { extractErrorMessage } from "@/lib/api/client";
import { useAppDispatch } from "@/store/hooks";
import { notify } from "@/store/slices/toasts-slice";
import type { SalesOrderStatus } from "@/lib/types";
import { SALES_ORDER_STATUS_LABELS } from "@/lib/status-labels";

export function useSalesOrdersQuery(filters: SalesOrderFilters) {
  return useQuery({
    queryKey: ["sales-orders", filters],
    queryFn: () => salesOrdersApi.list(filters),
  });
}

export function useSalesOrderQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["sales-orders", id],
    queryFn: () => salesOrdersApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useSalesOrderAuditTrailQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["sales-orders", id, "audit"],
    queryFn: () => salesOrdersApi.auditTrail(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateSalesOrderMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (input: CreateSalesOrderInput) => salesOrdersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      dispatch(notify({ message: "Ordem de Venda criada.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useUpdateSalesOrderStatusMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SalesOrderStatus }) => salesOrdersApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", variables.id, "audit"] });
      dispatch(notify({ message: `Status atualizado para ${SALES_ORDER_STATUS_LABELS[variables.status]}.`, tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useUpdateSalesOrderTransportMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ id, transportTypeId }: { id: string; transportTypeId: string }) =>
      salesOrdersApi.updateTransport(id, transportTypeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", variables.id, "audit"] });
      dispatch(notify({ message: "Tipo de transporte atualizado.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}
