"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { useCreateItemMutation } from "@/hooks/use-items";
import type { Item } from "@/lib/types";

const schema = z.object({
  sku: z.string().min(2, "Mínimo 2 caracteres"),
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface QuickCreateItemModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (item: Item) => void;
}

export function QuickCreateItemModal({ open, onClose, onCreated }: QuickCreateItemModalProps) {
  const createItem = useCreateItemMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function handleClose() {
    reset();
    onClose();
  }

  const onSubmit = handleSubmit(async (values) => {
    const created = await createItem.mutateAsync(values);
    reset();
    onCreated(created);
  });

  return (
    <Modal open={open} onClose={handleClose} title="Cadastrar novo item">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
        <FieldWrapper label="SKU" error={errors.sku?.message}>
          <Input placeholder="SKU-00123" {...register("sku")} />
        </FieldWrapper>
        <FieldWrapper label="Nome" error={errors.name?.message}>
          <Input placeholder="ex: Chapa de aço galvanizado" {...register("name")} />
        </FieldWrapper>
        <FieldWrapper label="Descrição" error={errors.description?.message}>
          <Input placeholder="Opcional" {...register("description")} />
        </FieldWrapper>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={Plus} loading={createItem.isPending}>
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
