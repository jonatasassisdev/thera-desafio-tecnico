"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Save, Users, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { DocumentInput } from "@/components/ui/document-input";
import { SearchInput } from "@/components/ui/search-input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { formatDocument } from "@/lib/format-document";
import { normalizeText } from "@/lib/normalize-text";
import { EmptyState, Spinner } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import {
  useCreateCustomerMutation,
  useCustomersQuery,
  useDeleteCustomerMutation,
  useUpdateCustomerMutation,
} from "@/hooks/use-customers";
import { useTransportTypesQuery } from "@/hooks/use-transport-types";
import type { Customer } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  document: z.string().refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 11 || digits.length === 14;
  }, "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido"),
  email: z.union([z.string().email("Email inválido"), z.literal("")]).optional(),
  authorizedTransportTypeIds: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [transportTypeFilter, setTransportTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const { data: customers, isLoading } = useCustomersQuery();
  const { data: transportTypes } = useTransportTypesQuery();
  const createCustomer = useCreateCustomerMutation();
  const updateCustomer = useUpdateCustomerMutation();
  const deleteCustomer = useDeleteCustomerMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", document: "", email: "", authorizedTransportTypeIds: [] },
  });

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        document: editing.document,
        email: editing.email ?? "",
        authorizedTransportTypeIds: editing.authorizedTransportTypes.map((entry) => entry.transportTypeId),
      });
    } else {
      reset({ name: "", document: "", email: "", authorizedTransportTypeIds: [] });
    }
  }, [editing, reset]);

  function openCreateModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(customer: Customer) {
    setEditing(customer);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  const onSubmit = handleSubmit(async (values) => {
    const input = { ...values, email: values.email || undefined };
    if (editing) {
      await updateCustomer.mutateAsync({ id: editing.id, input });
    } else {
      await createCustomer.mutateAsync(input);
    }
    closeModal();
  });

  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  const transportTypeOptions = (transportTypes ?? []).map((transportType) => ({
    value: transportType.id,
    label: transportType.name,
  }));

  const filteredCustomers = (customers ?? []).filter((customer) => {
    const matchesSearch =
      !search ||
      normalizeText(customer.name).includes(normalizeText(search)) ||
      customer.document.replace(/\D/g, "").includes(search.replace(/\D/g, ""));
    const matchesTransportType =
      !transportTypeFilter ||
      customer.authorizedTransportTypes.some((entry) => entry.transportTypeId === transportTypeFilter);
    return matchesSearch && matchesTransportType;
  });

  const hasActiveFilters = Boolean(search || transportTypeFilter);

  const totalPages = Math.max(Math.ceil(filteredCustomers.length / PAGE_SIZE), 1);
  const pagedCustomers = filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cadastros"
        title="Clientes"
        description="Cada cliente pode ter uma lista de tipos de transporte autorizados, usada para validar as Ordens de Venda."
        action={
          <Button icon={Plus} onClick={openCreateModal}>
            Novo cliente
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou documento..."
          />
          <AutocompleteInput
            value={transportTypeFilter}
            onChange={(value) => {
              setTransportTypeFilter(value);
              setPage(1);
            }}
            options={transportTypeOptions}
            placeholder="Todos os transportes autorizados"
            emptyMessage="Nenhum tipo de transporte encontrado."
          />
        </div>
        {hasActiveFilters && (
          <div className="border-t border-line px-5 py-2">
            <button
              onClick={() => {
                setSearch("");
                setTransportTypeFilter("");
                setPage(1);
              }}
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
        ) : !customers || customers.length === 0 ? (
          <EmptyState title="Nenhum cliente cadastrado ainda" icon={Users} />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState title="Nenhum cliente encontrado" description="Tente ajustar os filtros." icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Documento</th>
                  <th className="px-5 py-3 font-medium">Transportes autorizados</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {pagedCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-line-soft last:border-0">
                    <td className="px-5 py-3 text-text-primary">{customer.name}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-text-secondary">{formatDocument(customer.document)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {customer.authorizedTransportTypes.length === 0 ? (
                          <span className="text-xs text-text-muted">Nenhum</span>
                        ) : (
                          customer.authorizedTransportTypes.map((entry) => (
                            <span
                              key={entry.transportTypeId}
                              className="whitespace-nowrap rounded-sm border border-line px-2 py-0.5 text-[11px] text-text-secondary"
                            >
                              {entry.transportType.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-accent hover:underline"
                        >
                          <Pencil size={13} strokeWidth={2} />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleting(customer)}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-danger hover:underline"
                        >
                          <Trash2 size={13} strokeWidth={2} />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredCustomers.length > 0 && (
          <Pagination page={page} totalPages={totalPages} total={filteredCustomers.length} onPageChange={setPage} />
        )}
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? `Editando ${editing.name}` : "Novo cliente"}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldWrapper label="Nome" error={errors.name?.message}>
              <Input placeholder="ex: Thera Consulting" {...register("name")} />
            </FieldWrapper>
            <FieldWrapper label="Documento" error={errors.document?.message}>
              <Controller
                control={control}
                name="document"
                render={({ field }) => (
                  <DocumentInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                )}
              />
            </FieldWrapper>
          </div>

          <FieldWrapper label="Email" error={errors.email?.message}>
            <Input placeholder="Opcional" {...register("email")} />
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
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" icon={editing ? Save : Plus} loading={isSaving}>
              {editing ? "Salvar alterações" : "Adicionar cliente"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await deleteCustomer.mutateAsync(deleting.id);
          setDeleting(null);
        }}
        title={`Excluir ${deleting?.name ?? "cliente"}?`}
        description="Esta ação não pode ser desfeita. Clientes com Ordens de Venda vinculadas não podem ser excluídos."
        loading={deleteCustomer.isPending}
      />
    </div>
  );
}
