'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { Loader2, Megaphone } from 'lucide-react';

const comunicadoSchema = z.object({
  titulo: z.string().min(1, 'El título del comunicado es obligatorio'),
  contenido: z.string().min(5, 'El mensaje debe tener al menos 5 caracteres'),
  tipo: z.enum(['asamblea', 'mantenimiento', 'comunicado_general', 'emergencia']),
  prioridad: z.enum(['normal', 'urgente']),
  idComplejo: z.string().optional(),
});

export type ComunicadoFormValues = z.infer<typeof comunicadoSchema>;

interface ConsorcioComunicadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ComunicadoFormValues) => Promise<void>;
  isSubmitLoading: boolean;
  complejosOptions?: { value: string; label: string }[];
}

export default function ConsorcioComunicadoModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitLoading,
  complejosOptions = [],
}: ConsorcioComunicadoModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ComunicadoFormValues>({
    resolver: zodResolver(comunicadoSchema),
    defaultValues: {
      titulo: '',
      contenido: '',
      tipo: 'comunicado_general',
      prioridad: 'normal',
      idComplejo: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        titulo: '',
        contenido: '',
        tipo: 'comunicado_general',
        prioridad: 'normal',
        idComplejo: '',
      });
    }
  }, [isOpen, reset]);

  const onFormSubmit = async (data: ComunicadoFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (err: any) {
      setError('root', { message: err.message || 'Error al emitir comunicado' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publicar Comunicado Masivo (CU-CONS-07)"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {errors.root && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <span>{errors.root.message}</span>
          </div>
        )}

        <FormInput
          label="Título del Aviso / Comunicado"
          placeholder="Ej. Convocatoria a Asamblea General Ordinaria"
          {...register('titulo')}
          error={errors.titulo?.message}
          disabled={isSubmitLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tipo de Comunicado
            </label>
            <select
              {...register('tipo')}
              disabled={isSubmitLoading}
              className="w-full px-3 py-2 rounded-xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
            >
              <option value="comunicado_general">General Institucional</option>
              <option value="asamblea">Convocatoria a Asamblea</option>
              <option value="mantenimiento">Aviso de Mantenimiento / Corte</option>
              <option value="emergencia">Alerta / Emergencia</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nivel de Prioridad
            </label>
            <select
              {...register('prioridad')}
              disabled={isSubmitLoading}
              className="w-full px-3 py-2 rounded-xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
            >
              <option value="normal">Normal (Feed de la App)</option>
              <option value="urgente">Urgente (Push Notif + Email)</option>
            </select>
          </div>
        </div>

        {complejosOptions.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alcance / Edificio Destinatario
            </label>
            <select
              {...register('idComplejo')}
              disabled={isSubmitLoading}
              className="w-full px-3 py-2 rounded-xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
            >
              <option value="">Todos los Complejos del Consorcio</option>
              {complejosOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Cuerpo del Mensaje
          </label>
          <textarea
            {...register('contenido')}
            disabled={isSubmitLoading}
            rows={4}
            placeholder="Escriba aquí los detalles del comunicado para los residentes..."
            className="w-full px-3.5 py-2.5 rounded-2xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all resize-none"
          />
          {errors.contenido && (
            <span className="text-[11px] font-semibold text-red-500">{errors.contenido.message}</span>
          )}
        </div>

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
                Publicando...
              </>
            ) : (
              <>
                <Megaphone className="w-4 h-4" />
                Publicar Comunicado
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
