'use client';

import React, { useState } from 'react';
import { CheckCircle2, X, Wrench, DollarSign, AlertCircle } from 'lucide-react';
import { incidenciaService, ResolucionPayload } from '../services/incidenciaService';

interface ResolverIncidenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  idIncidencia: number;
  nombreAmenity?: string;
  onSuccess?: () => void;
}

export const ResolverIncidenciaModal: React.FC<ResolverIncidenciaModalProps> = ({
  isOpen,
  onClose,
  idIncidencia,
  nombreAmenity,
  onSuccess,
}) => {
  const [detalleTrabajos, setDetalleTrabajos] = useState<string>('');
  const [costoEstimado, setCostoEstimado] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detalleTrabajos.trim()) {
      setErrorMsg('Debe especificar el detalle de los trabajos realizados.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: ResolucionPayload = {
      idIncidencia,
      detalleTrabajos: detalleTrabajos.trim(),
      costoEstimado: Number(costoEstimado) || 0,
    };

    try {
      const res = await incidenciaService.resolver(payload);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.errorMessage || 'Error al resolver la incidencia.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
          <Wrench className="w-6 h-6" />
          <h2 className="text-lg font-bold">Resolver Incidencia & Rehabilitar Amenity (CU-04)</h2>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Incidencia <strong className="text-zinc-900 dark:text-zinc-100">#{idIncidencia}</strong>
          {nombreAmenity && ` — ${nombreAmenity}`}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Detalle de Trabajos Realizados *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ej. Reemplazo de bomba de agua y verificación de sellado..."
              value={detalleTrabajos}
              onChange={(e) => setDetalleTrabajos(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Costo Estimado de Reparación ($) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={costoEstimado}
                onChange={(e) => setCostoEstimado(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
            Al resolver la incidencia, el amenity pasará automáticamente a estado <strong>DISPONIBLE</strong> en la grilla de reservación.
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Procesando...' : 'Rehabilitar Amenity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
