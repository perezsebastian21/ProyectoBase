'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/constants';
import type { Complejo } from '../../complejos/types';
import type { UnidadHabitacional, CreateUnidadPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormCheckbox } from '@/components/ui/FormCheckbox';
import { Loader2, AlertTriangle } from 'lucide-react';

const ESTADOS_UNIDAD = [
  { value: 'HABILITADA', label: 'Habilitada' },
  { value: 'INHABILITADA', label: 'Inhabilitada' },
  { value: 'EN_MANTENIMIENTO', label: 'En Mantenimiento' },
];

const unidadSchema = z.object({
  identificador: z.string().min(1, 'El identificador (ej. 4B, Lote 12) es obligatorio'),
  idComplejo: z.string().min(1, 'Debes asociar la unidad a un complejo'),
  estadoUnidad: z.string().min(1, 'El estado es obligatorio'),
  debeExpensas: z.boolean(),
  saldoActual: z.number().min(0, 'El saldo no puede ser negativo'),
  contadorInfracciones: z.number().int().min(0, 'Las infracciones no pueden ser negativas'),
});

type UnidadFormValues = z.infer<typeof unidadSchema>;

interface UnidadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: UnidadHabitacional | null;
  complejos: Complejo[];
  isLoadingComplejos: boolean;
  isSubmitLoading: boolean;
}

export default function UnidadFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  complejos,
  isLoadingComplejos,
  isSubmitLoading,
}: UnidadFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UnidadFormValues>({
    resolver: zodResolver(unidadSchema),
    defaultValues: {
      identificador: '',
      idComplejo: '',
      estadoUnidad: 'HABILITADA',
      debeExpensas: false,
      saldoActual: 0,
      contadorInfracciones: 0,
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        identificador: initialData.identificador,
        idComplejo: initialData.idComplejo.toString(),
        estadoUnidad: initialData.estadoUnidad,
        debeExpensas: initialData.debeExpensas,
        saldoActual: initialData.saldoActual,
        contadorInfracciones: initialData.contadorInfracciones,
      });
    } else if (isOpen) {
      reset({
        identificador: '',
        idComplejo: complejos.length > 0 ? complejos[0].idComplejo.toString() : '',
        estadoUnidad: 'HABILITADA',
        debeExpensas: false,
        saldoActual: 0,
        contadorInfracciones: 0,
      });
    }
  }, [initialData, isOpen, complejos, reset]);

  const onFormSubmit = async (data: UnidadFormValues) => {
    const payload: CreateUnidadPayload = {
      identificador: data.identificador.trim(),
      idComplejo: Number(data.idComplejo),
      estadoUnidad: data.estadoUnidad,
      debeExpensas: data.debeExpensas,
      saldoActual: Number(data.saldoActual),
      contadorInfracciones: Number(data.contadorInfracciones),
    };

    const res = await onSubmit(initialData ? { ...payload, idUnidadHabitacional: initialData.idUnidadHabitacional } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasNoComplejos = complejos.length === 0 && !isLoadingComplejos;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Unidad Habitacional' : 'Nueva Unidad Habitacional'}
      maxWidth="md"
    >
      {hasNoComplejos ? (
        <div className="mt-2 space-y-6 text-center py-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-[var(--foreground)]">Se requiere un Complejo</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              No hay complejos registrados en el sistema. Debes crear al menos un complejo para poder asociar una nueva unidad.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link
              href={ROUTES.COMPLEJOS || '/dashboard/complejos'}
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Crear Complejo
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--brand-surface-bright)]/30 text-gray-500 hover:text-gray-800 text-sm hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {errors.root && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <span>{errors.root.message}</span>
            </div>
          )}

          <FormSelect
            label="Complejo Asociado"
            {...register('idComplejo')}
            error={errors.idComplejo?.message}
            disabled={isSubmitLoading || isLoadingComplejos}
            options={complejos.map(c => ({ value: c.idComplejo.toString(), label: c.nombre }))}
          />

          <FormInput
            label="Identificador (Nro, Letra, Lote)"
            placeholder="Ej. 4B, Lote 12"
            {...register('identificador')}
            error={errors.identificador?.message}
            disabled={isSubmitLoading}
          />

          <FormSelect
            label="Estado"
            {...register('estadoUnidad')}
            error={errors.estadoUnidad?.message}
            disabled={isSubmitLoading}
            options={ESTADOS_UNIDAD}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Saldo Actual ($)"
              type="number"
              step="0.01"
              {...register('saldoActual', { valueAsNumber: true })}
              error={errors.saldoActual?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Infracciones"
              type="number"
              {...register('contadorInfracciones', { valueAsNumber: true })}
              error={errors.contadorInfracciones?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="pt-2">
            <FormCheckbox
              label="¿Debe Expensas?"
              description="Marcar si la unidad tiene deudas pendientes."
              {...register('debeExpensas')}
              error={errors.debeExpensas?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--brand-surface-bright)]/30 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--brand-surface-bright)]/30 text-sm font-semibold hover:bg-[var(--brand-surface-container)] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isSubmitLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
