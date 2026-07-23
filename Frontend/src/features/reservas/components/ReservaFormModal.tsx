'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Amenity } from '../../amenities/types';
import type { UnidadHabitacional } from '../../unidades/types';
import type { Reserva, CreateReservaPayload } from '../types';
import type { ComplejoActivo } from '@/components/providers';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2, AlertTriangle, Building2 } from 'lucide-react';

const ESTADOS_RESERVA = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'APROBADA', label: 'Aprobada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const reservaSchema = z.object({
  idAmenity: z.string().min(1, 'Debes seleccionar un amenity'),
  idUnidadHabitacional: z.string().min(1, 'Debes seleccionar una unidad'),
  fechaUso: z.string().min(1, 'La fecha es obligatoria'),
  horaInicio: z.string().min(1, 'La hora de inicio es obligatoria'),
  horaFin: z.string().min(1, 'La hora de fin es obligatoria'),
  cantidadInvitados: z.number().int().min(0, 'La cantidad no puede ser negativa'),
  estado: z.string().min(1, 'El estado es obligatorio'),
});

type ReservaFormValues = z.infer<typeof reservaSchema>;

interface ReservaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Reserva | null;
  amenities: Amenity[];
  unidades: UnidadHabitacional[];
  isLoadingDependencies: boolean;
  isSubmitLoading: boolean;
  complejoActivo: ComplejoActivo | null;
}

export default function ReservaFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  amenities,
  unidades,
  isLoadingDependencies,
  isSubmitLoading,
  complejoActivo,
}: ReservaFormModalProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ReservaFormValues>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      idAmenity: '',
      idUnidadHabitacional: '',
      fechaUso: '',
      horaInicio: '',
      horaFin: '',
      cantidadInvitados: 0,
      estado: 'PENDIENTE',
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
        horaFin: initialData.horaFin.slice(0, 5),
        cantidadInvitados: initialData.cantidadInvitados,
        estado: initialData.estado,
      });
    } else if (isOpen) {
      reset({
        idAmenity: amenities.length > 0 ? amenities[0].idAmenity.toString() : '',
        idUnidadHabitacional: unidades.length > 0 ? unidades[0].idUnidadHabitacional.toString() : '',
        fechaUso: '',
        horaInicio: '',
        horaFin: '',
        cantidadInvitados: 0,
        estado: 'PENDIENTE',
      });
    }
  }, [initialData, isOpen, amenities, unidades, reset]);

  const onFormSubmit = async (data: ReservaFormValues) => {
    const formatTime = (time: string) => time.length === 5 ? `${time}:00` : time;

    const payload: CreateReservaPayload = {
      idAmenity: Number(data.idAmenity),
      idUnidadHabitacional: Number(data.idUnidadHabitacional),
      fechaUso: data.fechaUso, // Depending on backend, may need ISO format
      horaInicio: formatTime(data.horaInicio),
      horaFin: formatTime(data.horaFin),
      cantidadInvitados: Number(data.cantidadInvitados),
      estado: data.estado,
    };

    const res = await onSubmit(initialData ? { ...payload, idReserva: initialData.idReserva } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasMissingDependencies = (amenities.length === 0 || unidades.length === 0) && !isLoadingDependencies;
  const noComplejoSelected = !complejoActivo && !isLoadingDependencies;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Reserva' : 'Nueva Reserva'}
      maxWidth="md"
    >
      {/* Warning: sin complejo seleccionado */}
      {noComplejoSelected ? (
        <div className="mt-2 space-y-6 text-center py-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500 border border-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-[var(--foreground)]">Seleccioná un Edificio</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              Para crear o editar una reserva, primero tenés que seleccionar el
              <strong> Consorcio</strong> y el <strong>Edificio/Complejo</strong> en el Dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => { onClose(); router.push('/'); }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all"
            >
              🏢 Ir al Dashboard
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--brand-surface-bright)]/30 text-gray-500 hover:text-gray-800 text-sm hover:bg-gray-50 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : hasMissingDependencies ? (
        <div className="mt-2 space-y-6 text-center py-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-[var(--foreground)]">Faltan Datos Previos</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              Necesitas tener registrados al menos un <strong>Amenity</strong> y una <strong>Unidad Habitacional</strong> para poder crear reservas.
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
            label="Unidad Habitacional solicitante"
            {...register('idUnidadHabitacional')}
            error={errors.idUnidadHabitacional?.message}
            disabled={isSubmitLoading || isLoadingDependencies}
            options={unidades.map(u => ({ value: u.idUnidadHabitacional.toString(), label: u.identificador }))}
          />

          <FormInput
            label="Fecha de Uso"
            type="date"
            {...register('fechaUso')}
            error={errors.fechaUso?.message}
            disabled={isSubmitLoading}
          />

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

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Cantidad de Invitados"
              type="number"
              {...register('cantidadInvitados', { valueAsNumber: true })}
              error={errors.cantidadInvitados?.message}
              disabled={isSubmitLoading}
            />

            <FormSelect
              label="Estado"
              {...register('estado')}
              error={errors.estado?.message}
              disabled={isSubmitLoading}
              options={ESTADOS_RESERVA}
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
