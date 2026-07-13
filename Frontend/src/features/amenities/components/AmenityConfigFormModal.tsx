'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Amenity } from '../types';
import type { AmenityConfig, CreateAmenityConfigPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormCheckbox } from '@/components/ui/FormCheckbox';
import { Loader2, AlertTriangle } from 'lucide-react';

const configSchema = z.object({
  idAmenity: z.string().min(1, 'Debes seleccionar un amenity'),
  horarioInicio: z.string().min(1, 'El horario de inicio es obligatorio'),
  horarioFin: z.string().min(1, 'El horario de fin es obligatorio'),
  duracionBloqueMinutos: z.number().int().min(1, 'La duración debe ser mayor a 0'),
  tiempoLimpiezaMinutos: z.number().int().min(0, 'El tiempo no puede ser negativo'),
  tarifa: z.number().min(0, 'La tarifa no puede ser negativa'),
  limiteReservasMesUnidad: z.number().int().min(0, 'El límite no puede ser negativo'),
  requiereAprobacion: z.boolean(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface AmenityConfigFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: AmenityConfig | null;
  amenities: Amenity[];
  isLoadingAmenities: boolean;
  isSubmitLoading: boolean;
}

export default function AmenityConfigFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  amenities,
  isLoadingAmenities,
  isSubmitLoading,
}: AmenityConfigFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      idAmenity: '',
      horarioInicio: '',
      horarioFin: '',
      duracionBloqueMinutos: 60,
      tiempoLimpiezaMinutos: 0,
      tarifa: 0,
      limiteReservasMesUnidad: 0,
      requiereAprobacion: false,
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        idAmenity: initialData.idAmenity.toString(),
        horarioInicio: initialData.horarioInicio.slice(0, 5), // Assumes "HH:mm:ss" from backend, we want "HH:mm" for input type time
        horarioFin: initialData.horarioFin.slice(0, 5),
        duracionBloqueMinutos: initialData.duracionBloqueMinutos,
        tiempoLimpiezaMinutos: initialData.tiempoLimpiezaMinutos,
        tarifa: initialData.tarifa,
        limiteReservasMesUnidad: initialData.limiteReservasMesUnidad,
        requiereAprobacion: initialData.requiereAprobacion,
      });
    } else if (isOpen) {
      reset({
        idAmenity: amenities.length > 0 ? amenities[0].idAmenity.toString() : '',
        horarioInicio: '08:00',
        horarioFin: '22:00',
        duracionBloqueMinutos: 60,
        tiempoLimpiezaMinutos: 0,
        tarifa: 0,
        limiteReservasMesUnidad: 0,
        requiereAprobacion: false,
      });
    }
  }, [initialData, isOpen, amenities, reset]);

  const onFormSubmit = async (data: ConfigFormValues) => {
    // Add seconds to time for TimeOnly mapping in backend, if needed.
    // "HH:mm" -> "HH:mm:00"
    const formatTime = (time: string) => time.length === 5 ? `${time}:00` : time;

    const payload: CreateAmenityConfigPayload = {
      idAmenity: Number(data.idAmenity),
      horarioInicio: formatTime(data.horarioInicio),
      horarioFin: formatTime(data.horarioFin),
      duracionBloqueMinutos: Number(data.duracionBloqueMinutos),
      tiempoLimpiezaMinutos: Number(data.tiempoLimpiezaMinutos),
      tarifa: Number(data.tarifa),
      limiteReservasMesUnidad: Number(data.limiteReservasMesUnidad),
      requiereAprobacion: data.requiereAprobacion,
    };

    const res = await onSubmit(initialData ? { ...payload, idAmenityConfig: initialData.idAmenityConfig } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasNoAmenities = amenities.length === 0 && !isLoadingAmenities;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Configuración' : 'Nueva Configuración'}
      maxWidth="md"
    >
      {hasNoAmenities ? (
        <div className="mt-2 space-y-6 text-center py-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-[var(--foreground)]">Se requiere un Amenity</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              No hay amenities registrados. Debes crear al menos uno para configurar sus reglas.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <button
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
            label="Amenity a Configurar"
            {...register('idAmenity')}
            error={errors.idAmenity?.message}
            disabled={isSubmitLoading || isLoadingAmenities}
            options={amenities.map(a => ({ value: a.idAmenity.toString(), label: a.nombre }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Horario Inicio"
              type="time"
              {...register('horarioInicio')}
              error={errors.horarioInicio?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Horario Fin"
              type="time"
              {...register('horarioFin')}
              error={errors.horarioFin?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Duración Bloque (min)"
              type="number"
              {...register('duracionBloqueMinutos', { valueAsNumber: true })}
              error={errors.duracionBloqueMinutos?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Tiempo Limpieza (min)"
              type="number"
              {...register('tiempoLimpiezaMinutos', { valueAsNumber: true })}
              error={errors.tiempoLimpiezaMinutos?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Tarifa ($)"
              type="number"
              step="0.01"
              {...register('tarifa', { valueAsNumber: true })}
              error={errors.tarifa?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Límite Reservas / Mes"
              type="number"
              {...register('limiteReservasMesUnidad', { valueAsNumber: true })}
              error={errors.limiteReservasMesUnidad?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="pt-2">
            <FormCheckbox
              label="Requiere Aprobación"
              description="Si se marca, las reservas requerirán aprobación manual de la administración."
              {...register('requiereAprobacion')}
              error={errors.requiereAprobacion?.message}
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
