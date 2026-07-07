import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { itemsApi, type ItemInput } from "@/lib/api/items";
import { extractErrorMessage } from "@/lib/api/client";
import { useAppDispatch } from "@/store/hooks";
import { notify } from "@/store/slices/toasts-slice";

export function useItemsQuery() {
  return useQuery({ queryKey: ["items"], queryFn: itemsApi.list });
}

export function useCreateItemMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (input: ItemInput) => itemsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      dispatch(notify({ message: "Item criado.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useUpdateItemMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ItemInput> }) => itemsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      dispatch(notify({ message: "Item atualizado.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}

export function useDeleteItemMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (id: string) => itemsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      dispatch(notify({ message: "Item excluído.", tone: "success" }));
    },
    onError: (error) => dispatch(notify({ message: extractErrorMessage(error), tone: "error" })),
  });
}
