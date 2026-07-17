'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Complejo } from '../../complejos/types';
import type { Amenity, CreateAmenityPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2, AlertTriangle } from 'lucide-react';

const ESTADOS_AMENITY = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'MANTENIMIENTO', label: 'En Mantenimiento' },
  { value: 'INACTIVO', label: 'Inactivo' },
];

const amenitySchema = z.object({
  idComplejo: z.string().min(1, 'Debes asociar el amenity a un complejo'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  capacidad: z.number().int().min(1, 'La capacidad mínima es 1'),
  estado: z.string().min(1, 'El estado es obligatorio'),
});

type AmenityFormValues = z.infer<typeof amenitySchema>;

interface AmenityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Amenity | null;
  complejos: Complejo[];
  isLoadingComplejos: boolean;
  isSubmitLoading: boolean;
}

export default function AmenityFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  complejos,
  isLoadingComplejos,
  isSubmitLoading,
}: AmenityFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AmenityFormValues>({
    resolver: zodResolver(amenitySchema),
    defaultValues: {
      idComplejo: '',
      nombre: '',
      capacidad: 1,
      estado: 'ACTIVO',
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        idComplejo: initialData.idComplejo.toString(),
        nombre: initialData.nombre,
        capacidad: initialData.capacidad,
        estado: initialData.estado,
      });
    } else if (isOpen) {
      reset({
        idComplejo: complejos.length > 0 ? complejos[0].idComplejo.toString() : '',
        nombre: '',
        capacidad: 1,
        estado: 'ACTIVO',
      });
    }
  }, [initialData, isOpen, complejos, reset]);

  const onFormSubmit = async (data: AmenityFormValues) => {
    const payload: CreateAmenityPayload = {
      idComplejo: Number(data.idComplejo),
      nombre: data.nombre.trim(),
      capacidad: Number(data.capacidad),
      estado: data.estado,
    };

    const res = await onSubmit(initialData ? { ...payload, idAmenity: initialData.idAmenity } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasNoComplejos = complejos.length === 0 && !isLoadingComplejos;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Amenity' : 'Nuevo Amenity'}
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
              No hay complejos registrados en el sistema. Debes crear al menos uno para poder registrar un amenity.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link
              href="/dashboard/complejos"
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
            label="Complejo"
            {...register('idComplejo')}
            error={errors.idComplejo?.message}
            disabled={isSubmitLoading || isLoadingComplejos}
            options={complejos.map(c => ({ value: c.idComplejo.toString(), label: c.nombre }))}
          />

          <FormInput
            label="Nombre del Amenity"
            placeholder="Ej. SUM, Piscina, Parrilla"
            {...register('nombre')}
            error={errors.nombre?.message}
            disabled={isSubmitLoading}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Capacidad Máxima"
              type="number"
              {...register('capacidad', { valueAsNumber: true })}
              error={errors.capacidad?.message}
              disabled={isSubmitLoading}
            />

            <FormSelect
              label="Estado"
              {...register('estado')}
              error={errors.estado?.message}
              disabled={isSubmitLoading}
              options={ESTADOS_AMENITY}
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
