import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi, type CustomerInput } from "@/lib/api/customers";
import { extractErrorMessage } from "@/lib/api/client";
import { useAppDispatch } from "@/store/hooks";
import { notify } from "@/store/slices/toasts-slice";

export function useCustomersQuery() {
  return useQuery({ queryKey: ["customers"], queryFn: customersApi.list });
}

export function useCustomerQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customersApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (input: CustomerInput) => customersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      dispatch(notify({ message: "Cliente criado.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CustomerInput> }) => customersApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      dispatch(notify({ message: "Cliente atualizado.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      dispatch(notify({ message: "Cliente excluído.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}
