import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schedulingApi, type SchedulingFilters, type SchedulingInput } from "@/lib/api/scheduling";
import { extractErrorMessage } from "@/lib/api/client";
import { useAppDispatch } from "@/store/hooks";
import { notify } from "@/store/slices/toasts-slice";

export function useSchedulingListQuery(filters: SchedulingFilters) {
  return useQuery({ queryKey: ["scheduling", filters], queryFn: () => schedulingApi.list(filters) });
}

function useInvalidateScheduling() {
  const queryClient = useQueryClient();
  return (salesOrderId: string) => {
    queryClient.invalidateQueries({ queryKey: ["scheduling"] });
    queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    queryClient.invalidateQueries({ queryKey: ["sales-orders", salesOrderId, "audit"] });
  };
}

export function useDefineSchedulingMutation() {
  const invalidate = useInvalidateScheduling();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ salesOrderId, input }: { salesOrderId: string; input: SchedulingInput }) =>
      schedulingApi.define(salesOrderId, input),
    onSuccess: (_, variables) => {
      invalidate(variables.salesOrderId);
      dispatch(notify({ message: "Agendamento de entrega definido.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useConfirmSchedulingMutation() {
  const invalidate = useInvalidateScheduling();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (salesOrderId: string) => schedulingApi.confirm(salesOrderId),
    onSuccess: (_, salesOrderId) => {
      invalidate(salesOrderId);
      dispatch(notify({ message: "Agendamento confirmado.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useRescheduleMutation() {
  const invalidate = useInvalidateScheduling();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ salesOrderId, input }: { salesOrderId: string; input: SchedulingInput }) =>
      schedulingApi.reschedule(salesOrderId, input),
    onSuccess: (_, variables) => {
      invalidate(variables.salesOrderId);
      dispatch(notify({ message: "Entrega reagendada.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}
