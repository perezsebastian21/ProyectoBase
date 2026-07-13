'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/constants';
import type { UnidadHabitacional } from '../../unidades/types';
import type { Inquilino, CreateInquilinoPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormCheckbox } from '@/components/ui/FormCheckbox';
import { Loader2, AlertTriangle } from 'lucide-react';

const inquilinoSchema = z.object({
  idUnidadHabitacional: z.string().min(1, 'Debes asociar el inquilino a una unidad'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().min(6, 'DNI no válido'),
  email: z.string().email('Email no válido'),
  celular: z.string().min(8, 'El celular es obligatorio'),
  activo: z.boolean(),
});

type InquilinoFormValues = z.infer<typeof inquilinoSchema>;

interface InquilinoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Inquilino | null;
  unidades: UnidadHabitacional[];
  isLoadingUnidades: boolean;
  isSubmitLoading: boolean;
}

export default function InquilinoFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  unidades,
  isLoadingUnidades,
  isSubmitLoading,
}: InquilinoFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<InquilinoFormValues>({
    resolver: zodResolver(inquilinoSchema),
    defaultValues: {
      idUnidadHabitacional: '',
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      celular: '',
      activo: true,
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        idUnidadHabitacional: initialData.idUnidadHabitacional.toString(),
        nombre: initialData.nombre,
        apellido: initialData.apellido,
        dni: initialData.dni,
        email: initialData.email,
        celular: initialData.celular,
        activo: initialData.activo,
      });
    } else if (isOpen) {
      reset({
        idUnidadHabitacional: unidades.length > 0 ? unidades[0].idUnidadHabitacional.toString() : '',
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        celular: '',
        activo: true,
      });
    }
  }, [initialData, isOpen, unidades, reset]);

  const onFormSubmit = async (data: InquilinoFormValues) => {
    const payload: CreateInquilinoPayload = {
      idUnidadHabitacional: Number(data.idUnidadHabitacional),
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      dni: data.dni.trim(),
      email: data.email.trim(),
      celular: data.celular.trim(),
      activo: data.activo,
    };

    const res = await onSubmit(initialData ? { ...payload, idInquilino: initialData.idInquilino } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasNoUnidades = unidades.length === 0 && !isLoadingUnidades;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Inquilino' : 'Nuevo Inquilino'}
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
              No hay unidades registradas en el sistema. Debes crear al menos una unidad para poder asociar un inquilino.
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

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Nombre"
              placeholder="Ej. Juan"
              {...register('nombre')}
              error={errors.nombre?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Apellido"
              placeholder="Ej. Pérez"
              {...register('apellido')}
              error={errors.apellido?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <FormInput
            label="DNI"
            placeholder="Ej. 12345678"
            {...register('dni')}
            error={errors.dni?.message}
            disabled={isSubmitLoading}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Email"
              type="email"
              placeholder="Ej. juan@ejemplo.com"
              {...register('email')}
              error={errors.email?.message}
              disabled={isSubmitLoading}
            />

            <FormInput
              label="Celular"
              placeholder="Ej. +54 9 11 1234-5678"
              {...register('celular')}
              error={errors.celular?.message}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="pt-2">
            <FormCheckbox
              label="Inquilino Activo"
              description="Si está activo, vive actualmente en la unidad."
              {...register('activo')}
              error={errors.activo?.message}
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
