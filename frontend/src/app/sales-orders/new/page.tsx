"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, X, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { QuickCreateCustomerModal } from "@/components/customers/quick-create-customer-modal";
import { QuickCreateTransportTypeModal } from "@/components/transport-types/quick-create-transport-type-modal";
import { QuickCreateItemModal } from "@/components/items/quick-create-item-modal";
import { useCustomersQuery, useUpdateCustomerMutation } from "@/hooks/use-customers";
import { useItemsQuery } from "@/hooks/use-items";
import { useCreateSalesOrderMutation } from "@/hooks/use-sales-orders";

const schema = z.object({
  customerId: z.string().min(1, "Selecione um cliente"),
  transportTypeId: z.string().min(1, "Selecione um tipo de transporte"),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, "Selecione um item"),
        quantity: z.number().int().min(1, "Mínimo 1"),
      }),
    )
    .min(1, "Adicione ao menos um item"),
});

type FormValues = z.infer<typeof schema>;

export default function NewSalesOrderPage() {
  const router = useRouter();
  const { data: customers } = useCustomersQuery();
  const { data: items } = useItemsQuery();
  const createSalesOrder = useCreateSalesOrderMutation();
  const updateCustomer = useUpdateCustomerMutation();

  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [creatingTransportType, setCreatingTransportType] = useState(false);
  const [creatingItemForIndex, setCreatingItemForIndex] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerId: "", transportTypeId: "", items: [{ itemId: "", quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const selectedCustomerId = watch("customerId");
  const selectedCustomer = customers?.find((customer) => customer.id === selectedCustomerId);
  const authorizedTransportTypes = selectedCustomer?.authorizedTransportTypes ?? [];

  const customerOptions = (customers ?? []).map((customer) => ({ value: customer.id, label: customer.name }));
  const transportTypeOptions = authorizedTransportTypes.map(({ transportType }) => ({
    value: transportType.id,
    label: transportType.name,
  }));
  const itemOptions = (items ?? []).map((item) => ({
    value: item.id,
    label: item.name,
    description: item.sku,
  }));

  const onSubmit = handleSubmit(async (values) => {
    const order = await createSalesOrder.mutateAsync({
      customerId: values.customerId,
      transportTypeId: values.transportTypeId,
      items: values.items.map((item) => ({ itemId: item.itemId, quantity: item.quantity })),
    });
    router.push(`/sales-orders/${order.id}`);
  });

  return (
    <div>
      <PageHeader
        eyebrow="Ordens de Venda"
        title="Nova Ordem de Venda"
        description="Apenas tipos de transporte autorizados para o cliente selecionado podem ser utilizados."
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldWrapper label="Cliente" error={errors.customerId?.message}>
              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <AutocompleteInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={customerOptions}
                    placeholder="Buscar cliente..."
                    emptyMessage="Nenhum cliente encontrado."
                    onCreateNew={() => setCreatingCustomer(true)}
                    createLabel="Cadastrar novo cliente"
                  />
                )}
              />
            </FieldWrapper>

            <FieldWrapper
              label="Tipo de transporte"
              error={errors.transportTypeId?.message}
              hint={
                selectedCustomerId && authorizedTransportTypes.length === 0
                  ? "Este cliente ainda não possui tipos de transporte autorizados."
                  : undefined
              }
            >
              <Controller
                control={control}
                name="transportTypeId"
                render={({ field }) => (
                  <AutocompleteInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={transportTypeOptions}
                    disabled={!selectedCustomerId}
                    placeholder={selectedCustomerId ? "Buscar tipo de transporte..." : "Selecione um cliente primeiro"}
                    emptyMessage="Nenhum tipo de transporte autorizado para este cliente."
                    onCreateNew={selectedCustomerId ? () => setCreatingTransportType(true) : undefined}
                    createLabel="Cadastrar novo tipo de transporte"
                  />
                )}
              />
            </FieldWrapper>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-text-primary">Itens</h2>
            <Button type="button" variant="secondary" icon={Plus} onClick={() => append({ itemId: "", quantity: 1 })}>
              Adicionar item
            </Button>
          </div>

          <div className="flex flex-col divide-y divide-line-soft">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 items-end gap-4 px-5 py-4 sm:grid-cols-[1fr_120px_auto]"
              >
                <FieldWrapper label="Item" error={errors.items?.[index]?.itemId?.message}>
                  <Controller
                    control={control}
                    name={`items.${index}.itemId` as const}
                    render={({ field: itemField }) => (
                      <AutocompleteInput
                        value={itemField.value}
                        onChange={itemField.onChange}
                        onBlur={itemField.onBlur}
                        options={itemOptions}
                        placeholder="Buscar item..."
                        emptyMessage="Nenhum item encontrado."
                        onCreateNew={() => setCreatingItemForIndex(index)}
                        createLabel="Cadastrar novo item"
                      />
                    )}
                  />
                </FieldWrapper>

                <FieldWrapper label="Quantidade" error={errors.items?.[index]?.quantity?.message}>
                  <Controller
                    control={control}
                    name={`items.${index}.quantity` as const}
                    render={({ field: quantityField }) => (
                      <Input
                        type="number"
                        min={1}
                        value={quantityField.value}
                        onChange={(e) => quantityField.onChange(e.target.valueAsNumber)}
                        onBlur={quantityField.onBlur}
                      />
                    )}
                  />
                </FieldWrapper>

                <Button
                  type="button"
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
          {errors.items?.message && <p className="px-5 pb-4 text-xs text-danger">{errors.items.message}</p>}
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" icon={X} onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" icon={Check} loading={createSalesOrder.isPending}>
            Criar Ordem de Venda
          </Button>
        </div>
      </form>

      <QuickCreateCustomerModal
        open={creatingCustomer}
        onClose={() => setCreatingCustomer(false)}
        onCreated={(customer) => {
          setValue("customerId", customer.id);
          setValue("transportTypeId", "");
          setCreatingCustomer(false);
        }}
      />

      <QuickCreateTransportTypeModal
        open={creatingTransportType}
        onClose={() => setCreatingTransportType(false)}
        onCreated={async (transportType) => {
          if (selectedCustomer) {
            const currentIds = selectedCustomer.authorizedTransportTypes.map((entry) => entry.transportTypeId);
            await updateCustomer.mutateAsync({
              id: selectedCustomer.id,
              input: { authorizedTransportTypeIds: [...currentIds, transportType.id] },
            });
          }
          setValue("transportTypeId", transportType.id);
          setCreatingTransportType(false);
        }}
      />

      <QuickCreateItemModal
        open={creatingItemForIndex !== null}
        onClose={() => setCreatingItemForIndex(null)}
        onCreated={(item) => {
          if (creatingItemForIndex !== null) {
            setValue(`items.${creatingItemForIndex}.itemId`, item.id);
          }
          setCreatingItemForIndex(null);
        }}
      />
    </div>
  );
}
