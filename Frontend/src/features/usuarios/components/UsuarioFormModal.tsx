'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Usuario, CreateUsuarioPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormCheckbox } from '@/components/ui/FormCheckbox';
import { Loader2 } from 'lucide-react';

const usuarioSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ser un email válido'),
  password: z.string().optional(),
  activo: z.boolean(),
}).refine(data => {
  // If it's a new user (which we can infer if we check initialData in the component, 
  // but here we just check if it has a password or if it's optional for edit)
  return true;
});

// We need a specific schema for create vs update because password is required for create
const getUsuarioSchema = (isEditing: boolean) => z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ser un email válido'),
  password: isEditing 
    ? z.string().optional()
    : z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  activo: z.boolean(),
});

type UsuarioFormValues = z.infer<ReturnType<typeof getUsuarioSchema>>;

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Usuario | null;
  isSubmitLoading: boolean;
}

export default function UsuarioFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitLoading,
}: UsuarioFormModalProps) {
  const isEditing = !!initialData;
  const schema = getUsuarioSchema(isEditing);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      activo: true,
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        username: initialData.username,
        email: initialData.email,
        password: '',
        activo: initialData.activo,
      });
    } else if (isOpen) {
      reset({
        username: '',
        email: '',
        password: '',
        activo: true,
      });
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: z.infer<typeof schema>) => {
    const payload: CreateUsuarioPayload = {
      username: data.username.trim(),
      email: data.email.trim(),
      activo: data.activo,
    };

    if (data.password) {
      payload.password = data.password;
    }

    const res = await onSubmit(initialData ? { ...payload, idUsuario: initialData.idUsuario } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Usuario' : 'Nuevo Usuario'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {errors.root && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <span>{errors.root.message}</span>
          </div>
        )}

        <FormInput
          label="Nombre de Usuario"
          placeholder="Ej. jcgarcia"
          {...register('username')}
          error={errors.username?.message}
          disabled={isSubmitLoading}
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="Ej. correo@ejemplo.com"
          {...register('email')}
          error={errors.email?.message}
          disabled={isSubmitLoading}
        />

        <FormInput
          label={initialData ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
          type="password"
          placeholder="********"
          {...register('password')}
          error={errors.password?.message}
          disabled={isSubmitLoading}
        />

        <div className="pt-2">
          <FormCheckbox
            label="Usuario Activo"
            description="Si se desmarca, el usuario no podrá iniciar sesión."
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
    </Modal>
  );
}
