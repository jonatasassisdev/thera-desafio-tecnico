import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transportTypesApi, type TransportTypeInput } from "@/lib/api/transport-types";
import { extractErrorMessage } from "@/lib/api/client";
import { useAppDispatch } from "@/store/hooks";
import { notify } from "@/store/slices/toasts-slice";

export function useTransportTypesQuery() {
  return useQuery({ queryKey: ["transport-types"], queryFn: transportTypesApi.list });
}

export function useCreateTransportTypeMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (input: TransportTypeInput) => transportTypesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-types"] });
      dispatch(notify({ message: "Tipo de transporte criado.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useUpdateTransportTypeMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TransportTypeInput> & { active?: boolean } }) =>
      transportTypesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-types"] });
      dispatch(notify({ message: "Tipo de transporte atualizado.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useDeleteTransportTypeMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (id: string) => transportTypesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-types"] });
      dispatch(notify({ message: "Tipo de transporte excluído.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}
