"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { DocumentInput } from "@/components/ui/document-input";
import { useCreateCustomerMutation } from "@/hooks/use-customers";
import { useTransportTypesQuery } from "@/hooks/use-transport-types";
import type { Customer } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  document: z.string().refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 11 || digits.length === 14;
  }, "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido"),
  authorizedTransportTypeIds: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

interface QuickCreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
}

export function QuickCreateCustomerModal({ open, onClose, onCreated }: QuickCreateCustomerModalProps) {
  const { data: transportTypes } = useTransportTypesQuery();
  const createCustomer = useCreateCustomerMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", document: "", authorizedTransportTypeIds: [] },
  });

  function handleClose() {
    reset();
    onClose();
  }

  const onSubmit = handleSubmit(async (values) => {
    const created = await createCustomer.mutateAsync(values);
    reset();
    onCreated(created);
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Cadastrar novo cliente"
      description="Defina ao menos um tipo de transporte autorizado para já poder usar este cliente na Ordem de Venda."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
        <FieldWrapper label="Nome" error={errors.name?.message}>
          <Input placeholder="ex: Thera Consulting" {...register("name")} />
        </FieldWrapper>

        <FieldWrapper label="Documento" error={errors.document?.message}>
          <Controller
            control={control}
            name="document"
            render={({ field }) => <DocumentInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
          />
        </FieldWrapper>

        <FieldWrapper label="Tipos de transporte autorizados">
          <Controller
            control={control}
            name="authorizedTransportTypeIds"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {transportTypes?.map((transportType) => {
                  const checked = field.value.includes(transportType.id);
                  return (
                    <button
                      type="button"
                      key={transportType.id}
                      onClick={() =>
                        field.onChange(
                          checked
                            ? field.value.filter((id) => id !== transportType.id)
                            : [...field.value, transportType.id],
                        )
                      }
                      className={`rounded-sm border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                        checked
                          ? "border-accent bg-accent-wash text-accent"
                          : "border-line text-text-secondary hover:border-text-muted"
                      }`}
                    >
                      {transportType.name}
                    </button>
                  );
                })}
                {!transportTypes?.length && (
                  <span className="text-xs text-text-muted">Cadastre um tipo de transporte primeiro.</span>
                )}
              </div>
            )}
          />
        </FieldWrapper>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={Plus} loading={createCustomer.isPending}>
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
