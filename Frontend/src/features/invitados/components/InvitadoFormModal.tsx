'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/constants';
import type { UnidadHabitacional } from '../../unidades/types';
import type { Invitado, CreateInvitadoPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2, AlertTriangle } from 'lucide-react';

const invitadoSchema = z.object({
  idUnidadHabitacional: z.string().min(1, 'Debes asociar el invitado a una unidad'),
  nombreCompleto: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  dni: z.string().min(6, 'DNI no válido'),
  fechaExpiracion: z.string().min(1, 'La fecha de expiración es obligatoria'),
  patente: z.string().optional(),
});

type InvitadoFormValues = z.infer<typeof invitadoSchema>;

interface InvitadoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Invitado | null;
  unidades: UnidadHabitacional[];
  isLoadingUnidades: boolean;
  isSubmitLoading: boolean;
}

export default function InvitadoFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  unidades,
  isLoadingUnidades,
  isSubmitLoading,
}: InvitadoFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<InvitadoFormValues>({
    resolver: zodResolver(invitadoSchema),
    defaultValues: {
      idUnidadHabitacional: '',
      nombreCompleto: '',
      dni: '',
      fechaExpiracion: '',
      patente: '',
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      const fecha = initialData.fechaExpiracion ? initialData.fechaExpiracion.split('T')[0] : '';
      reset({
        idUnidadHabitacional: initialData.idUnidadHabitacional.toString(),
        nombreCompleto: initialData.nombreCompleto,
        dni: initialData.dni,
        fechaExpiracion: fecha,
        patente: initialData.patente || '',
      });
    } else if (isOpen) {
      reset({
        idUnidadHabitacional: unidades.length > 0 ? unidades[0].idUnidadHabitacional.toString() : '',
        nombreCompleto: '',
        dni: '',
        fechaExpiracion: '',
        patente: '',
      });
    }
  }, [initialData, isOpen, unidades, reset]);

  const onFormSubmit = async (data: InvitadoFormValues) => {
    const payload: CreateInvitadoPayload = {
      idUnidadHabitacional: Number(data.idUnidadHabitacional),
      nombreCompleto: data.nombreCompleto.trim(),
      dni: data.dni.trim(),
      fechaExpiracion: data.fechaExpiracion,
      patente: data.patente?.trim() || '',
    };

    const res = await onSubmit(initialData ? { ...payload, idInvitado: initialData.idInvitado } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasNoUnidades = unidades.length === 0 && !isLoadingUnidades;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Invitado' : 'Nuevo Invitado'}
      maxWidth="md"
    >
      {hasNoUnidades ? (
        <div className="mt-2 space-y-6 text-center py-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-[var(--foreground)]">Se requiere una Unidad</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              No hay unidades registradas en el sistema. Debes crear al menos una unidad para poder asociar un invitado.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link
              href="/dashboard/unidades"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Crear Unidad
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
            label="Unidad Habitacional"
            {...register('idUnidadHabitacional')}
            error={errors.idUnidadHabitacional?.message}
            disabled={isSubmitLoading || isLoadingUnidades}
            options={unidades.map(u => ({ value: u.idUnidadHabitacional.toString(), label: u.identificador }))}
          />

          <FormInput
            label="Nombre Completo"
            placeholder="Ej. Carlos Mendoza"
            {...register('nombreCompleto')}
            error={errors.nombreCompleto?.message}
            disabled={isSubmitLoading}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="DNI"
              placeholder="Ej. 12345678"
              {...register('dni')}
              error={errors.dni?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Patente (Opcional)"
              placeholder="Ej. AB 123 CD"
              {...register('patente')}
              error={errors.patente?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <FormInput
            label="Válido hasta (Expiración)"
            type="date"
            {...register('fechaExpiracion')}
            error={errors.fechaExpiracion?.message}
            disabled={isSubmitLoading}
          />

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
