'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Amenity } from '../../amenities/types';
import type { UnidadHabitacional } from '../../unidades/types';
import type { Incidencia, CreateIncidenciaPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2, AlertTriangle } from 'lucide-react';

const ESTADOS_INCIDENCIA = [
  { value: 'REPORTADA', label: 'Reportada' },
  { value: 'EN_REVISION', label: 'En Revisión' },
  { value: 'EN_REPARACION', label: 'En Reparación' },
  { value: 'RESUELTA', label: 'Resuelta' },
  { value: 'DESCARTADA', label: 'Descartada' },
];

const incidenciaSchema = z.object({
  idAmenity: z.string().min(1, 'Debes seleccionar un amenity'),
  idUnidadHabitacional: z.string().min(1, 'Debes seleccionar una unidad que reporta'),
  descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  estado: z.string().min(1, 'El estado es obligatorio'),
  detalleResolucion: z.string().optional(),
  costoEstimado: z.number().min(0, 'El costo no puede ser negativo').optional().or(z.nan()),
});

type IncidenciaFormValues = z.infer<typeof incidenciaSchema>;

interface IncidenciaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Incidencia | null;
  amenities: Amenity[];
  unidades: UnidadHabitacional[];
  isLoadingDependencies: boolean;
  isSubmitLoading: boolean;
}

export default function IncidenciaFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  amenities,
  unidades,
  isLoadingDependencies,
  isSubmitLoading,
}: IncidenciaFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<IncidenciaFormValues>({
    resolver: zodResolver(incidenciaSchema),
    defaultValues: {
      idAmenity: '',
      idUnidadHabitacional: '',
      descripcion: '',
      estado: 'REPORTADA',
      detalleResolucion: '',
      costoEstimado: 0,
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        idAmenity: initialData.idAmenity.toString(),
        idUnidadHabitacional: initialData.idUnidadHabitacional.toString(),
        descripcion: initialData.descripcion,
        estado: initialData.estado,
        detalleResolucion: initialData.detalleResolucion || '',
        costoEstimado: initialData.costoEstimado || 0,
      });
    } else if (isOpen) {
      reset({
        idAmenity: amenities.length > 0 ? amenities[0].idAmenity.toString() : '',
        idUnidadHabitacional: unidades.length > 0 ? unidades[0].idUnidadHabitacional.toString() : '',
        descripcion: '',
        estado: 'REPORTADA',
        detalleResolucion: '',
        costoEstimado: 0,
      });
    }
  }, [initialData, isOpen, amenities, unidades, reset]);

  const onFormSubmit = async (data: IncidenciaFormValues) => {
    const payload: CreateIncidenciaPayload = {
      idAmenity: Number(data.idAmenity),
      idUnidadHabitacional: Number(data.idUnidadHabitacional),
      descripcion: data.descripcion.trim(),
      estado: data.estado,
      detalleResolucion: data.detalleResolucion?.trim() || undefined,
      costoEstimado: isNaN(Number(data.costoEstimado)) ? undefined : Number(data.costoEstimado),
    };

    const res = await onSubmit(initialData ? { ...payload, idIncidencia: initialData.idIncidencia } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasMissingDependencies = (amenities.length === 0 || unidades.length === 0) && !isLoadingDependencies;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Incidencia' : 'Nueva Incidencia'}
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
              Necesitas tener registrados al menos un <strong>Amenity</strong> y una <strong>Unidad Habitacional</strong> para poder reportar incidencias.
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
            label="Amenity Afectado"
            {...register('idAmenity')}
            error={errors.idAmenity?.message}
            disabled={isSubmitLoading || isLoadingDependencies}
            options={amenities.map(a => ({ value: a.idAmenity.toString(), label: a.nombre }))}
          />

          <FormSelect
            label="Unidad Habitacional que reporta"
            {...register('idUnidadHabitacional')}
            error={errors.idUnidadHabitacional?.message}
            disabled={isSubmitLoading || isLoadingDependencies}
            options={unidades.map(u => ({ value: u.idUnidadHabitacional.toString(), label: u.identificador }))}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Descripción</label>
            <textarea
              {...register('descripcion')}
              disabled={isSubmitLoading}
              rows={3}
              placeholder="Detalle el problema..."
              className="w-full px-3 py-2.5 bg-[var(--brand-surface)] border border-[var(--brand-surface-bright)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            {errors.descripcion && (
              <span className="text-xs text-red-500">{errors.descripcion.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Estado"
              {...register('estado')}
              error={errors.estado?.message}
              disabled={isSubmitLoading}
              options={ESTADOS_INCIDENCIA}
            />
            
            <FormInput
              label="Costo Estimado ($)"
              type="number"
              step="0.01"
              {...register('costoEstimado', { valueAsNumber: true })}
              error={errors.costoEstimado?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Detalle de Resolución (Opcional)</label>
            <textarea
              {...register('detalleResolucion')}
              disabled={isSubmitLoading}
              rows={2}
              placeholder="Detalle si la incidencia fue resuelta o descartada..."
              className="w-full px-3 py-2.5 bg-[var(--brand-surface)] border border-[var(--brand-surface-bright)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            {errors.detalleResolucion && (
              <span className="text-xs text-red-500">{errors.detalleResolucion.message}</span>
            )}
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
