'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Amenity } from '../../amenities/types';
import type { UnidadHabitacional } from '../../unidades/types';
import type { ListaEspera, CreateListaEsperaPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2, AlertTriangle } from 'lucide-react';

const ESTADOS_LISTA = [
  { value: 'EN_ESPERA', label: 'En Espera' },
  { value: 'ASIGNADA', label: 'Asignada (Reserva Creada)' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const listaSchema = z.object({
  idAmenity: z.string().min(1, 'Debes seleccionar un amenity'),
  idUnidadHabitacional: z.string().min(1, 'Debes seleccionar una unidad'),
  fechaUso: z.string().min(1, 'La fecha es obligatoria'),
  horaInicio: z.string().min(1, 'La hora de inicio es obligatoria'),
  posicion: z.number().int().min(1, 'La posición debe ser al menos 1'),
  estado: z.string().min(1, 'El estado es obligatorio'),
});

type ListaFormValues = z.infer<typeof listaSchema>;

interface ListaEsperaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: ListaEspera | null;
  amenities: Amenity[];
  unidades: UnidadHabitacional[];
  isLoadingDependencies: boolean;
  isSubmitLoading: boolean;
}

export default function ListaEsperaFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  amenities,
  unidades,
  isLoadingDependencies,
  isSubmitLoading,
}: ListaEsperaFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ListaFormValues>({
    resolver: zodResolver(listaSchema),
    defaultValues: {
      idAmenity: '',
      idUnidadHabitacional: '',
      fechaUso: '',
      horaInicio: '',
      posicion: 1,
      estado: 'EN_ESPERA',
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      const fecha = initialData.fechaUso ? initialData.fechaUso.split('T')[0] : '';
      reset({
        idAmenity: initialData.idAmenity.toString(),
        idUnidadHabitacional: initialData.idUnidadHabitacional.toString(),
        fechaUso: fecha,
        horaInicio: initialData.horaInicio.slice(0, 5),
        posicion: initialData.posicion,
        estado: initialData.estado,
      });
    } else if (isOpen) {
      reset({
        idAmenity: amenities.length > 0 ? amenities[0].idAmenity.toString() : '',
        idUnidadHabitacional: unidades.length > 0 ? unidades[0].idUnidadHabitacional.toString() : '',
        fechaUso: '',
        horaInicio: '',
        posicion: 1,
        estado: 'EN_ESPERA',
      });
    }
  }, [initialData, isOpen, amenities, unidades, reset]);

  const onFormSubmit = async (data: ListaFormValues) => {
    const formatTime = (time: string) => time.length === 5 ? `${time}:00` : time;

    const payload: CreateListaEsperaPayload = {
      idAmenity: Number(data.idAmenity),
      idUnidadHabitacional: Number(data.idUnidadHabitacional),
      fechaUso: data.fechaUso,
      horaInicio: formatTime(data.horaInicio),
      posicion: Number(data.posicion),
      estado: data.estado,
    };

    const res = await onSubmit(initialData ? { ...payload, idListaEspera: initialData.idListaEspera } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasMissingDependencies = (amenities.length === 0 || unidades.length === 0) && !isLoadingDependencies;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Registro en Lista' : 'Nuevo Registro en Lista'}
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
              Necesitas tener registrados al menos un <strong>Amenity</strong> y una <strong>Unidad Habitacional</strong> para poder usar la lista de espera.
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
            label="Amenity"
            {...register('idAmenity')}
            error={errors.idAmenity?.message}
            disabled={isSubmitLoading || isLoadingDependencies}
            options={amenities.map(a => ({ value: a.idAmenity.toString(), label: a.nombre }))}
          />

          <FormSelect
            label="Unidad Habitacional en espera"
            {...register('idUnidadHabitacional')}
            error={errors.idUnidadHabitacional?.message}
            disabled={isSubmitLoading || isLoadingDependencies}
            options={unidades.map(u => ({ value: u.idUnidadHabitacional.toString(), label: u.identificador }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Fecha Deseada"
              type="date"
              {...register('fechaUso')}
              error={errors.fechaUso?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Hora Inicio"
              type="time"
              {...register('horaInicio')}
              error={errors.horaInicio?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Posición en Cola"
              type="number"
              {...register('posicion', { valueAsNumber: true })}
              error={errors.posicion?.message}
              disabled={isSubmitLoading}
            />

            <FormSelect
              label="Estado"
              {...register('estado')}
              error={errors.estado?.message}
              disabled={isSubmitLoading}
              options={ESTADOS_LISTA}
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
