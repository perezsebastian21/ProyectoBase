'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Persona, CreatePersonaPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { Loader2 } from 'lucide-react';

const personaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  dni: z.string().min(6, 'DNI no válido'),
  email: z.string().email('Email no válido'),
  celular: z.string().min(8, 'El celular es obligatorio'),
});

type PersonaFormValues = z.infer<typeof personaSchema>;

interface PersonaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Persona | null;
  isSubmitLoading: boolean;
}

export default function PersonaFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitLoading,
}: PersonaFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      dni: '',
      email: '',
      celular: '',
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      // Backend returns ISO string, we need YYYY-MM-DD for input type date
      const fecha = initialData.fechaNacimiento ? initialData.fechaNacimiento.split('T')[0] : '';
      reset({
        nombre: initialData.nombre,
        apellido: initialData.apellido,
        fechaNacimiento: fecha,
        dni: initialData.dni,
        email: initialData.email,
        celular: initialData.celular,
      });
    } else if (isOpen) {
      reset({
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        dni: '',
        email: '',
        celular: '',
      });
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: PersonaFormValues) => {
    const payload: CreatePersonaPayload = {
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      fechaNacimiento: new Date(data.fechaNacimiento).toISOString(), // Or format depending on backend expectation
      dni: data.dni.trim(),
      email: data.email.trim(),
      celular: data.celular.trim(),
    };

    const res = await onSubmit(initialData ? { ...payload, idPersona: initialData.idPersona } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Persona' : 'Nueva Persona'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {errors.root && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <span>{errors.root.message}</span>
          </div>
        )}

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

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="DNI"
            placeholder="Ej. 12345678"
            {...register('dni')}
            error={errors.dni?.message}
            disabled={isSubmitLoading}
          />

          <FormInput
            label="Fecha de Nacimiento"
            type="date"
            {...register('fechaNacimiento')}
            error={errors.fechaNacimiento?.message}
            disabled={isSubmitLoading}
          />
        </div>

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
