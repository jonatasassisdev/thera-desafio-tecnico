"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, X, CalendarClock, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldWrapper } from "@/components/ui/field";
import { DateInput } from "@/components/ui/date-input";
import { TimeInput } from "@/components/ui/time-input";
import { SchedulingStatusBadge } from "@/components/ui/status-badge";
import { useConfirmSchedulingMutation, useDefineSchedulingMutation, useRescheduleMutation } from "@/hooks/use-scheduling";
import type { Scheduling } from "@/lib/types";

const schema = z.object({
  deliveryDate: z.string().min(1, "Obrigatório"),
  windowStart: z.string().regex(/^\d{2}:\d{2}$/, "HH:mm"),
  windowEnd: z.string().regex(/^\d{2}:\d{2}$/, "HH:mm"),
});

type FormValues = z.infer<typeof schema>;

export function SchedulingPanel({ salesOrderId, scheduling }: { salesOrderId: string; scheduling: Scheduling | null }) {
  const [editing, setEditing] = useState(!scheduling);

  const define = useDefineSchedulingMutation();
  const confirm = useConfirmSchedulingMutation();
  const reschedule = useRescheduleMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryDate: scheduling ? scheduling.deliveryDate.slice(0, 10) : "",
      windowStart: scheduling?.windowStart ?? "08:00",
      windowEnd: scheduling?.windowEnd ?? "12:00",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!scheduling) {
      await define.mutateAsync({ salesOrderId, input: values });
    } else {
      await reschedule.mutateAsync({ salesOrderId, input: values });
    }
    setEditing(false);
  });

  const isSaving = define.isPending || reschedule.isPending;

  if (!editing && scheduling) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SchedulingStatusBadge status={scheduling.status} />
          <div className="flex flex-wrap gap-2">
            {scheduling.status !== "CONFIRMED" && (
              <Button
                variant="secondary"
                icon={Check}
                onClick={() => confirm.mutate(salesOrderId)}
                loading={confirm.isPending}
              >
                Confirmar
              </Button>
            )}
            <Button variant="ghost" icon={CalendarClock} onClick={() => setEditing(true)}>
              Reagendar
            </Button>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-muted">Data de entrega</dt>
            <dd className="mono-tabular mt-1 text-text-primary">
              {new Date(scheduling.deliveryDate).toLocaleDateString("pt-BR")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-muted">Início da janela</dt>
            <dd className="mono-tabular mt-1 text-text-primary">{scheduling.windowStart}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-muted">Fim da janela</dt>
            <dd className="mono-tabular mt-1 text-text-primary">{scheduling.windowEnd}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FieldWrapper label="Data de entrega" error={errors.deliveryDate?.message}>
          <Controller
            control={control}
            name="deliveryDate"
            render={({ field }) => (
              <DateInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="Selecionar data" />
            )}
          />
        </FieldWrapper>
        <FieldWrapper label="Início da janela" error={errors.windowStart?.message}>
          <Controller
            control={control}
            name="windowStart"
            render={({ field }) => <TimeInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
          />
        </FieldWrapper>
        <FieldWrapper label="Fim da janela" error={errors.windowEnd?.message}>
          <Controller
            control={control}
            name="windowEnd"
            render={({ field }) => <TimeInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
          />
        </FieldWrapper>
      </div>
      <div className="flex justify-end gap-3">
        {scheduling && (
          <Button type="button" variant="secondary" icon={X} onClick={() => setEditing(false)}>
            Cancelar
          </Button>
        )}
        <Button type="submit" icon={CalendarPlus} loading={isSaving}>
          {scheduling ? "Salvar novo agendamento" : "Definir agendamento"}
        </Button>
      </div>
    </form>
  );
}
