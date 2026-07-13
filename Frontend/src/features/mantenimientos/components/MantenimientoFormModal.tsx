'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Amenity } from '../../amenities/types';
import type { Mantenimiento, CreateMantenimientoPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2, AlertTriangle } from 'lucide-react';

const RECURRENCIA_OPTIONS = [
  { value: 'UNICO', label: 'Único' },
  { value: 'DIARIO', label: 'Diario' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'ANUAL', label: 'Anual' },
];

const mantenimientoSchema = z.object({
  idAmenity: z.string().min(1, 'Debes seleccionar un amenity'),
  descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  recurrencia: z.string().min(1, 'La recurrencia es obligatoria'),
  horaInicio: z.string().min(1, 'La hora de inicio es obligatoria'),
  horaFin: z.string().min(1, 'La hora de fin es obligatoria'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fechaFin: z.string().min(1, 'La fecha de fin es obligatoria'),
});

type MantenimientoFormValues = z.infer<typeof mantenimientoSchema>;

interface MantenimientoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Mantenimiento | null;
  amenities: Amenity[];
  isLoadingDependencies: boolean;
  isSubmitLoading: boolean;
}

export default function MantenimientoFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  amenities,
  isLoadingDependencies,
  isSubmitLoading,
}: MantenimientoFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MantenimientoFormValues>({
    resolver: zodResolver(mantenimientoSchema),
    defaultValues: {
      idAmenity: '',
      descripcion: '',
      recurrencia: 'UNICO',
      horaInicio: '',
      horaFin: '',
      fechaInicio: '',
      fechaFin: '',
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        idAmenity: initialData.idAmenity.toString(),
        descripcion: initialData.descripcion,
        recurrencia: initialData.recurrencia,
        horaInicio: initialData.horaInicio.slice(0, 5),
        horaFin: initialData.horaFin.slice(0, 5),
        fechaInicio: initialData.fechaInicio ? initialData.fechaInicio.split('T')[0] : '',
        fechaFin: initialData.fechaFin ? initialData.fechaFin.split('T')[0] : '',
      });
    } else if (isOpen) {
      reset({
        idAmenity: amenities.length > 0 ? amenities[0].idAmenity.toString() : '',
        descripcion: '',
        recurrencia: 'UNICO',
        horaInicio: '',
        horaFin: '',
        fechaInicio: '',
        fechaFin: '',
      });
    }
  }, [initialData, isOpen, amenities, reset]);

  const onFormSubmit = async (data: MantenimientoFormValues) => {
    const formatTime = (time: string) => time.length === 5 ? `${time}:00` : time;

    const payload: CreateMantenimientoPayload = {
      idAmenity: Number(data.idAmenity),
      descripcion: data.descripcion.trim(),
      recurrencia: data.recurrencia,
      horaInicio: formatTime(data.horaInicio),
      horaFin: formatTime(data.horaFin),
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
    };

    const res = await onSubmit(initialData ? { ...payload, idMantenimiento: initialData.idMantenimiento } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasMissingDependencies = amenities.length === 0 && !isLoadingDependencies;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Mantenimiento' : 'Programar Mantenimiento'}
      maxWidth="md"
    >
      {hasMissingDependencies ? (
        <div className="mt-2 space-y-6 text-center py-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-[var(--foreground)]">Faltan Datos Previos</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              Necesitas tener registrados al menos un <strong>Amenity</strong> para poder programar mantenimientos.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--brand-surface-bright)]/30 text-gray-500 hover:text-gray-800 text-sm hover:bg-gray-50 transition-all"
            >
              Cerrar
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
            label="Amenity a mantener"
            {...register('idAmenity')}
            error={errors.idAmenity?.message}
            disabled={isSubmitLoading || isLoadingDependencies}
            options={amenities.map(a => ({ value: a.idAmenity.toString(), label: a.nombre }))}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Descripción</label>
            <textarea
              {...register('descripcion')}
              disabled={isSubmitLoading}
              rows={2}
              placeholder="Detalle el mantenimiento a realizar..."
              className="w-full px-3 py-2.5 bg-[var(--brand-surface)] border border-[var(--brand-surface-bright)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            {errors.descripcion && (
              <span className="text-xs text-red-500">{errors.descripcion.message}</span>
            )}
          </div>

          <FormSelect
            label="Recurrencia"
            {...register('recurrencia')}
            error={errors.recurrencia?.message}
            disabled={isSubmitLoading}
            options={RECURRENCIA_OPTIONS}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Fecha Inicio"
              type="date"
              {...register('fechaInicio')}
              error={errors.fechaInicio?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Fecha Fin"
              type="date"
              {...register('fechaFin')}
              error={errors.fechaFin?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Hora Inicio"
              type="time"
              {...register('horaInicio')}
              error={errors.horaInicio?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Hora Fin"
              type="time"
              {...register('horaFin')}
              error={errors.horaFin?.message}
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
