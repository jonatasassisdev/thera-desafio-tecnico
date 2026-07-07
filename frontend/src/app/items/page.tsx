"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Package, Pencil, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, Spinner } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { normalizeText } from "@/lib/normalize-text";
import { useCreateItemMutation, useDeleteItemMutation, useItemsQuery, useUpdateItemMutation } from "@/hooks/use-items";
import type { Item } from "@/lib/types";

const schema = z.object({
  sku: z.string().min(2, "Mínimo 2 caracteres"),
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PAGE_SIZE = 10;

export default function ItemsPage() {
  const { data: items, isLoading } = useItemsQuery();
  const createItem = useCreateItemMutation();
  const updateItem = useUpdateItemMutation();
  const deleteItem = useDeleteItemMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editing) {
      reset({ sku: editing.sku, name: editing.name, description: editing.description ?? "" });
    } else {
      reset({ sku: "", name: "", description: "" });
    }
  }, [editing, reset]);

  function openCreateModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(item: Item) {
    setEditing(item);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  const onSubmit = handleSubmit(async (values) => {
    if (editing) {
      await updateItem.mutateAsync({ id: editing.id, input: values });
    } else {
      await createItem.mutateAsync(values);
    }
    closeModal();
  });

  const isSaving = createItem.isPending || updateItem.isPending;

  const filteredItems = (items ?? []).filter(
    (item) =>
      !search ||
      normalizeText(item.name).includes(normalizeText(search)) ||
      normalizeText(item.sku).includes(normalizeText(search)),
  );

  const totalPages = Math.max(Math.ceil(filteredItems.length / PAGE_SIZE), 1);
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Itens"
        description="Os itens precisam estar cadastrados antes de serem vinculados a uma Ordem de Venda."
        action={
          <Button icon={Plus} onClick={openCreateModal}>
            Novo item
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="p-5">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Buscar por SKU ou nome..."
          />
        </div>
        {search && (
          <div className="border-t border-line px-5 py-2">
            <button
              onClick={() => {
                setSearch("");
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
        ) : !items || items.length === 0 ? (
          <EmptyState title="Nenhum item cadastrado ainda" icon={Package} />
        ) : filteredItems.length === 0 ? (
          <EmptyState title="Nenhum item encontrado" description="Tente ajustar a busca." icon={Package} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Descrição</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((item) => (
                  <tr key={item.id} className="border-b border-line-soft last:border-0">
                    <td className="mono-tabular whitespace-nowrap px-5 py-3 text-text-secondary">{item.sku}</td>
                    <td className="px-5 py-3 text-text-primary">{item.name}</td>
                    <td className="px-5 py-3 text-text-secondary">{item.description ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-accent hover:underline"
                        >
                          <Pencil size={13} strokeWidth={2} />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleting(item)}
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
        {filteredItems.length > 0 && (
          <Pagination page={page} totalPages={totalPages} total={filteredItems.length} onPageChange={setPage} />
        )}
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? `Editando ${editing.name}` : "Novo item"}>
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
          await deleteItem.mutateAsync(deleting.id);
          setDeleting(null);
        }}
        title={`Excluir ${deleting?.name ?? "item"}?`}
        description="Esta ação não pode ser desfeita. Itens já vinculados a Ordens de Venda não podem ser excluídos."
        loading={deleteItem.isPending}
      />
    </div>
  );
}
