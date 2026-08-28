'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Usuario, CreateUsuarioPayload, Rol } from '../types';
import { rolService } from '../services/rolService';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormCheckbox } from '@/components/ui/FormCheckbox';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2 } from 'lucide-react';

const getUsuarioSchema = (isEditing: boolean) => z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ser un email válido'),
  password: isEditing 
    ? z.string().optional()
    : z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  activo: z.boolean(),
  idRol: z.union([z.string(), z.number()]).optional(),
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
  const [rolesCatalogo, setRolesCatalogo] = useState<Rol[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      activo: true,
      idRol: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (!isEditing) {
        setIsLoadingRoles(true);
        rolService.getCatalogo().then((res) => {
          if (res.success && res.data) {
            setRolesCatalogo(res.data);
          }
        }).finally(() => {
          setIsLoadingRoles(false);
        });
      }

      if (initialData) {
        reset({
          username: initialData.username,
          email: initialData.email,
          password: '',
          activo: initialData.activo,
          idRol: '',
        });
      } else {
        reset({
          username: '',
          email: '',
          password: '',
          activo: true,
          idRol: '',
        });
      }
    }
  }, [initialData, isOpen, isEditing, reset]);

  const onFormSubmit = async (data: UsuarioFormValues) => {
    const payload: CreateUsuarioPayload = {
      username: data.username.trim(),
      email: data.email.trim(),
      activo: data.activo,
    };

    if (data.password) {
      payload.password = data.password;
    }

    if (data.idRol && String(data.idRol).trim() !== '') {
      payload.idRol = Number(data.idRol);
    }

    const res = await onSubmit(initialData ? { ...payload, idUsuario: initialData.idUsuario } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const rolOptions = [
    { value: '', label: 'Sin rol inicial asignado' },
    ...rolesCatalogo.map((r) => ({
      value: r.idRol,
      label: `${r.nombre} (${r.descripcion})`,
    }))
  ];

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

        {!isEditing && (
          <div className="space-y-1">
            <FormSelect
              label={isLoadingRoles ? "Cargando roles..." : "Rol Inicial"}
              options={rolOptions}
              {...register('idRol')}
              error={errors.idRol?.message as string | undefined}
              disabled={isSubmitLoading || isLoadingRoles}
            />
            <p className="text-[11px] text-slate-400">
              Opcional: podés asignarle un rol ahora o gestionar múltiples roles después desde el botón "Roles".
            </p>
          </div>
        )}

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
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--brand-surface-bright)]/30 text-sm font-semibold hover:bg-[var(--brand-surface-container)] transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
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
