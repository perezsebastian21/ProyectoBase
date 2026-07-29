'use client';

import React, { useState } from 'react';
import { AlertOctagon, X, Ban, Calendar, AlertTriangle } from 'lucide-react';
import { amenityService, CancelacionMasivaPayload } from '../services/amenityService';

interface CancelacionMasivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  idAmenity: number;
  nombreAmenity: string;
  onSuccess?: () => void;
}

export const CancelacionMasivaModal: React.FC<CancelacionMasivaModalProps> = ({
  isOpen,
  onClose,
  idAmenity,
  nombreAmenity,
  onSuccess,
}) => {
  const [fechaDesde, setFechaDesde] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [motivoAdmin, setMotivoAdmin] = useState<string>('');
  const [cancelarReservas, setCancelarReservas] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoAdmin.trim()) {
      setErrorMsg('Debe detallar el motivo administrativo de la fuera de servicio.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: CancelacionMasivaPayload = {
      idAmenity,
      fechaDesde,
      fechaHasta: fechaHasta || undefined,
      motivoAdmin: motivoAdmin.trim(),
      cancelarReservasAfectadas: cancelarReservas,
    };

    try {
      const res = await amenityService.cancelacionMasiva(idAmenity, payload);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.errorMessage || 'Error al ejecutar la cancelación masiva.');
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
          <AlertOctagon className="w-6 h-6" />
          <h2 className="text-lg font-bold">Declarar Fuera de Servicio (CU-14)</h2>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Amenity: <strong className="text-zinc-900 dark:text-zinc-100">{nombreAmenity}</strong>
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Fecha Desde *
            </label>
            <input
              type="date"
              required
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Fecha Hasta (Opcional - dejar vacío si es indefinido)
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Motivo Administrativo (Comunicado a Residentes) *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ej. Desperfecto técnico en el sistema de filtrado de agua..."
              value={motivoAdmin}
              onChange={(e) => setMotivoAdmin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="cancelarReservas"
              checked={cancelarReservas}
              onChange={(e) => setCancelarReservas(e.target.checked)}
              className="mt-1 rounded border-amber-500/30 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="cancelarReservas" className="text-xs text-amber-800 dark:text-amber-300 cursor-pointer">
              <strong>Cancelar en cascada y reembolsar 100%</strong> todas las reservas afectadas en el período. Notificará automáticamente por Push/Email a cada residente.
            </label>
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
              {isSubmitting ? 'Procesando...' : 'Confirmar Fuera de Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
