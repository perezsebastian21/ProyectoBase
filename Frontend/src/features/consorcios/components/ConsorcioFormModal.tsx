'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Consorcio, CreateConsorcioPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { Loader2 } from 'lucide-react';

const consorcioSchema = z.object({
  nombre: z.string().min(1, 'El nombre del consorcio es obligatorio'),
  cuit: z.string()
    .regex(/^\d+$/, 'Debe contener solo números')
    .length(11, 'El CUIT debe tener exactamente 11 dígitos'),
  email: z.string().email('Ingresá un correo electrónico válido'),
  telefono: z.string().min(1, 'El teléfono de contacto es obligatorio'),
});

type ConsorcioFormValues = z.infer<typeof consorcioSchema>;

interface ConsorcioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Consorcio | null;
  isSubmitLoading: boolean;
}

export default function ConsorcioFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitLoading,
}: ConsorcioFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ConsorcioFormValues>({
    resolver: zodResolver(consorcioSchema),
    defaultValues: {
      nombre: '',
      cuit: '',
      email: '',
      telefono: '',
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        nombre: initialData.nombre,
        cuit: initialData.cuit,
        email: initialData.email,
        telefono: initialData.telefono,
      });
    } else if (isOpen) {
      reset({ nombre: '', cuit: '', email: '', telefono: '' });
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: ConsorcioFormValues) => {
    const payload: CreateConsorcioPayload = {
      ...data,
      email: data.email.toLowerCase(),
    };

    const res = await onSubmit(initialData ? { ...payload, idConsorcio: initialData.idConsorcio } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Consorcio' : 'Nuevo Consorcio'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {errors.root && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <span>{errors.root.message}</span>
          </div>
        )}

        <FormInput
          label="Nombre del Consorcio"
          placeholder="Ej. Consorcio Torres del Sol"
          {...register('nombre')}
          error={errors.nombre?.message}
          disabled={isSubmitLoading}
        />

        <FormInput
          label="CUIT"
          placeholder="Ej. 30712345678"
          {...register('cuit')}
          error={errors.cuit?.message}
          disabled={isSubmitLoading}
          maxLength={11}
        />

        <FormInput
          label="Email de Contacto"
          type="email"
          placeholder="Ej. contacto@torresdelsol.com"
          {...register('email')}
          error={errors.email?.message}
          disabled={isSubmitLoading}
        />

        <FormInput
          label="Teléfono de Contacto"
          placeholder="Ej. +54 11 4321-8765"
          {...register('telefono')}
          error={errors.telefono?.message}
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
    </Modal>
  );
}
