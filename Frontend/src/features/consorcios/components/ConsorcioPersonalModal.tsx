'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { Loader2 } from 'lucide-react';

const personalSchema = z.object({
  nombre: z.string().min(1, 'El nombre completo es obligatorio'),
  email: z.string().email('Ingresá un correo electrónico válido'),
  rol: z.enum(['admin', 'security', 'maintenance']),
  cargo: z.string().min(1, 'El cargo o función es obligatorio'),
  idComplejo: z.string().optional(),
});

export type PersonalFormValues = z.infer<typeof personalSchema>;

interface ConsorcioPersonalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonalFormValues) => Promise<void>;
  isSubmitLoading: boolean;
  complejosOptions?: { value: string; label: string }[];
}

export default function ConsorcioPersonalModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitLoading,
  complejosOptions = [],
}: ConsorcioPersonalModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      nombre: '',
      email: '',
      rol: 'security',
      cargo: 'Personal de Seguridad',
      idComplejo: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        nombre: '',
        email: '',
        rol: 'security',
        cargo: 'Personal de Seguridad',
        idComplejo: '',
      });
    }
  }, [isOpen, reset]);

  const onFormSubmit = async (data: PersonalFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (err: any) {
      setError('root', { message: err.message || 'Error al enviar invitación' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invitar / Asignar Personal al Consorcio"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {errors.root && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <span>{errors.root.message}</span>
          </div>
        )}

        <FormInput
          label="Nombre Completo del Colaborador"
          placeholder="Ej. Juan Manuel Pérez"
          {...register('nombre')}
          error={errors.nombre?.message}
          disabled={isSubmitLoading}
        />

        <FormInput
          label="Correo Electrónico para Invitación"
          type="email"
          placeholder="Ej. jmperez@edificio.com"
          {...register('email')}
          error={errors.email?.message}
          disabled={isSubmitLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rol del Sistema
            </label>
            <select
              {...register('rol')}
              disabled={isSubmitLoading}
              className="w-full px-3 py-2 rounded-xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
            >
              <option value="security">Personal de Seguridad / Vigilancia</option>
              <option value="maintenance">Personal de Mantenimiento</option>
              <option value="admin">Administrador de Edificio / Complejo</option>
            </select>
          </div>

          <FormInput
            label="Cargo o Descripción"
            placeholder="Ej. Vigilancia Nocturna"
            {...register('cargo')}
            error={errors.cargo?.message}
            disabled={isSubmitLoading}
          />
        </div>

        {complejosOptions.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ámbito / Edificio Asignado (Opcional)
            </label>
            <select
              {...register('idComplejo')}
              disabled={isSubmitLoading}
              className="w-full px-3 py-2 rounded-xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
            >
              <option value="">Todo el Consorcio (Global)</option>
              {complejosOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-brand-surface-bright/20 dark:border-white/10 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-brand-surface-bright/20 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-surface-container cursor-pointer transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isSubmitLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Invitación'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
