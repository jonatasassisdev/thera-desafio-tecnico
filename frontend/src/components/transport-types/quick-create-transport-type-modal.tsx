"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { useCreateTransportTypeMutation } from "@/hooks/use-transport-types";
import type { TransportType } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface QuickCreateTransportTypeModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (transportType: TransportType) => void;
}

export function QuickCreateTransportTypeModal({ open, onClose, onCreated }: QuickCreateTransportTypeModalProps) {
  const createTransportType = useCreateTransportTypeMutation();

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
    const created = await createTransportType.mutateAsync(values);
    reset();
    onCreated(created);
  });

  return (
    <Modal open={open} onClose={handleClose} title="Cadastrar novo tipo de transporte">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
        <FieldWrapper label="Nome" error={errors.name?.message}>
          <Input placeholder="ex: Carreta" {...register("name")} />
        </FieldWrapper>
        <FieldWrapper label="Descrição" error={errors.description?.message}>
          <Input placeholder="Opcional" {...register("description")} />
        </FieldWrapper>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={Plus} loading={createTransportType.isPending}>
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
