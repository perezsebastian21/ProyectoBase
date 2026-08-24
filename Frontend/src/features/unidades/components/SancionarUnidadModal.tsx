'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, Ban } from 'lucide-react';
import { unidadService, SancionPayload } from '../services/unidadService';

interface SancionarUnidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  idUnidadHabitacional: number;
  identificadorUnidad: string;
  onSuccess?: () => void;
}

export const SancionarUnidadModal: React.FC<SancionarUnidadModalProps> = ({
  isOpen,
  onClose,
  idUnidadHabitacional,
  identificadorUnidad,
  onSuccess,
}) => {
  const [descripcion, setDescripcion] = useState<string>('');
  const [aplicarSuspension, setAplicarSuspension] = useState<boolean>(true);
  const [duracionDias, setDuracionDias] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setErrorMsg('Debe especificar el motivo descriptivo de la sanción.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: SancionPayload = {
      idUnidadHabitacional,
      descripcion: descripcion.trim(),
      aplicarSuspension,
      duracionDias: Number(duracionDias) || 0,
    };

    try {
      const res = await unidadService.sancionar(payload);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.errorMessage || 'Error al sancionar la unidad habitacional.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de comunicación con el servidor.');
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

        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
          <ShieldAlert className="w-6 h-6" />
          <h2 className="text-lg font-bold">Sancionar Unidad Habitacional (CU-06)</h2>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Unidad: <strong className="text-zinc-900 dark:text-zinc-100">{identificadorUnidad}</strong>
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Motivo de la Sanción / Infracción *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ej. Ruídos molestos fuera de horario de descanso, inasistencias reiteradas o daño en amenidad..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="aplicarSuspension"
                checked={aplicarSuspension}
                onChange={(e) => setAplicarSuspension(e.target.checked)}
                className="mt-1 rounded border-amber-500/30 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="aplicarSuspension" className="text-xs text-amber-800 dark:text-amber-300 cursor-pointer">
                <strong>Aplicar Suspensión Inmediata (BR-SAN-002)</strong>: Cambia el estado a <code>SUSPENDIDA</code> y cancela todas las reservas futuras activas de la unidad.
              </label>
            </div>

            {aplicarSuspension && (
              <div>
                <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  Duración de la Suspensión (Días, 0 = Indefinido)
                </label>
                <input
                  type="number"
                  min="0"
                  value={duracionDias}
                  onChange={(e) => setDuracionDias(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-500/30 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}
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
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              {isSubmitting ? 'Procesando...' : 'Aplicar Sanción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
