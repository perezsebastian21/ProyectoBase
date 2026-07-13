'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/constants';
import type { Consorcio } from '../../consorcios/types';
import type { Complejo, CreateComplejoPayload } from '../types';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2, AlertTriangle } from 'lucide-react';

const TIPOS_COMPLEJO = [
  { value: 'EDIFICIO', label: 'Edificio' },
  { value: 'BARRIO_CERRADO', label: 'Barrio Cerrado' },
  { value: 'OTRO', label: 'Otro' },
];

const complejoSchema = z.object({
  nombre: z.string().min(1, 'El nombre del complejo es obligatorio'),
  tipo: z.string().min(1, 'El tipo es obligatorio'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
  idConsorcio: z.string().min(1, 'Debes asociar el complejo a un consorcio'),
});

type ComplejoFormValues = z.infer<typeof complejoSchema>;

interface ComplejoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Complejo | null;
  consorcios: Consorcio[];
  isLoadingConsorcios: boolean;
  isSubmitLoading: boolean;
}

export default function ComplejoFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  consorcios,
  isLoadingConsorcios,
  isSubmitLoading,
}: ComplejoFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ComplejoFormValues>({
    resolver: zodResolver(complejoSchema),
    defaultValues: {
      nombre: '',
      tipo: 'EDIFICIO',
      direccion: '',
      idConsorcio: '',
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        nombre: initialData.nombre,
        tipo: initialData.tipo,
        direccion: initialData.direccion,
        idConsorcio: initialData.idConsorcio.toString(),
      });
    } else if (isOpen) {
      reset({
        nombre: '',
        tipo: 'EDIFICIO',
        direccion: '',
        idConsorcio: consorcios.length > 0 ? consorcios[0].idConsorcio.toString() : '',
      });
    }
  }, [initialData, isOpen, consorcios, reset]);

  const onFormSubmit = async (data: ComplejoFormValues) => {
    const payload: CreateComplejoPayload = {
      nombre: data.nombre.trim(),
      tipo: data.tipo,
      direccion: data.direccion.trim(),
      idConsorcio: Number(data.idConsorcio),
    };

    const res = await onSubmit(initialData ? { ...payload, idComplejo: initialData.idComplejo } : payload);
    if (!res.success && res.error) {
      setError('root', { message: res.error });
    }
  };

  const hasNoConsorcios = consorcios.length === 0 && !isLoadingConsorcios;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Complejo' : 'Nuevo Complejo'}
      maxWidth="md"
    >
      {hasNoConsorcios ? (
        <div className="mt-2 space-y-6 text-center py-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-[var(--foreground)]">Se requiere un Consorcio</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              No hay consorcios registrados en el sistema. Debes crear al menos un consorcio para poder asociar un nuevo complejo.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link
              href={ROUTES.CONSORCIOS}
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Crear Consorcio
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
            label="Consorcio Asociado"
            {...register('idConsorcio')}
            error={errors.idConsorcio?.message}
            disabled={isSubmitLoading || isLoadingConsorcios}
            options={consorcios.map(c => ({ value: c.idConsorcio.toString(), label: c.nombre }))}
          />

          <FormInput
            label="Nombre del Complejo"
            placeholder="Ej. Torre Mirador Sur"
            {...register('nombre')}
            error={errors.nombre?.message}
            disabled={isSubmitLoading}
          />

          <FormSelect
            label="Tipo de Complejo"
            {...register('tipo')}
            error={errors.tipo?.message}
            disabled={isSubmitLoading}
            options={TIPOS_COMPLEJO}
          />

          <FormInput
            label="Dirección"
            placeholder="Ej. Av. del Libertador 4567"
            {...register('direccion')}
            error={errors.direccion?.message}
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
