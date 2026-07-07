"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Truck, Pencil, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { SearchInput } from "@/components/ui/search-input";
import { SelectInput } from "@/components/ui/select-input";
import { EmptyState, Spinner } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { chipToneClassName } from "@/components/ui/chip";
import { normalizeText } from "@/lib/normalize-text";
import {
  useCreateTransportTypeMutation,
  useDeleteTransportTypeMutation,
  useTransportTypesQuery,
  useUpdateTransportTypeMutation,
} from "@/hooks/use-transport-types";
import type { TransportType } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

const PAGE_SIZE = 10;

export default function TransportTypesPage() {
  const { data: transportTypes, isLoading } = useTransportTypesQuery();
  const createTransportType = useCreateTransportTypeMutation();
  const updateTransportType = useUpdateTransportTypeMutation();
  const deleteTransportType = useDeleteTransportTypeMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TransportType | null>(null);
  const [deleting, setDeleting] = useState<TransportType | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, description: editing.description ?? "" });
    } else {
      reset({ name: "", description: "" });
    }
  }, [editing, reset]);

  function openCreateModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(transportType: TransportType) {
    setEditing(transportType);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  const onSubmit = handleSubmit(async (values) => {
    if (editing) {
      await updateTransportType.mutateAsync({ id: editing.id, input: values });
    } else {
      await createTransportType.mutateAsync(values);
    }
    closeModal();
  });

  const isSaving = createTransportType.isPending || updateTransportType.isPending;

  const filteredTransportTypes = (transportTypes ?? []).filter((transportType) => {
    const matchesSearch = !search || normalizeText(transportType.name).includes(normalizeText(search));
    const matchesStatus =
      !statusFilter || (statusFilter === "active" ? transportType.active : !transportType.active);
    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = Boolean(search || statusFilter);

  const totalPages = Math.max(Math.ceil(filteredTransportTypes.length / PAGE_SIZE), 1);
  const pagedTransportTypes = filteredTransportTypes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cadastros"
        title="Tipos de transporte"
        description="Modalidades que podem ser autorizadas por cliente e utilizadas nas Ordens de Venda."
        action={
          <Button icon={Plus} onClick={openCreateModal}>
            Novo tipo de transporte
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
            placeholder="Buscar por nome..."
          />
          <SelectInput
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            placeholder="Todos os status"
          />
        </div>
        {hasActiveFilters && (
          <div className="border-t border-line px-5 py-2">
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
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
        ) : !transportTypes || transportTypes.length === 0 ? (
          <EmptyState title="Nenhum tipo de transporte cadastrado ainda" icon={Truck} />
        ) : filteredTransportTypes.length === 0 ? (
          <EmptyState title="Nenhum tipo de transporte encontrado" description="Tente ajustar os filtros." icon={Truck} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Descrição</th>
                  <th className="px-5 py-3 font-medium">Ativo</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {pagedTransportTypes.map((transportType) => (
                  <tr key={transportType.id} className="border-b border-line-soft last:border-0">
                    <td className="px-5 py-3 text-text-primary">{transportType.name}</td>
                    <td className="px-5 py-3 text-text-secondary">{transportType.description ?? "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <button
                        onClick={() =>
                          updateTransportType.mutate({ id: transportType.id, input: { active: !transportType.active } })
                        }
                        className={`rounded-full border-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${chipToneClassName(
                          transportType.active ? "success" : "disabled",
                        )}`}
                      >
                        {transportType.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(transportType)}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-accent hover:underline"
                        >
                          <Pencil size={13} strokeWidth={2} />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleting(transportType)}
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
        {filteredTransportTypes.length > 0 && (
          <Pagination page={page} totalPages={totalPages} total={filteredTransportTypes.length} onPageChange={setPage} />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? `Editando ${editing.name}` : "Novo tipo de transporte"}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
          <FieldWrapper label="Nome" error={errors.name?.message}>
            <Input placeholder="ex: Carreta" {...register("name")} />
          </FieldWrapper>
          <FieldWrapper label="Descrição" error={errors.description?.message}>
            <Input placeholder="Opcional" {...register("description")} />
          </FieldWrapper>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" icon={editing ? Save : Plus} loading={isSaving}>
              {editing ? "Salvar alterações" : "Adicionar"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await deleteTransportType.mutateAsync(deleting.id);
          setDeleting(null);
        }}
        title={`Excluir ${deleting?.name ?? "tipo de transporte"}?`}
        description="Esta ação não pode ser desfeita. Tipos de transporte já vinculados a clientes ou Ordens de Venda não podem ser excluídos."
        loading={deleteTransportType.isPending}
      />
    </div>
  );
}
