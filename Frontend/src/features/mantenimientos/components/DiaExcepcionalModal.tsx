'use client';

import React, { useState } from 'react';
import { CalendarOff, X, Plus, Calendar, AlertCircle } from 'lucide-react';
import { diaExcepcionalService, CreateDiaExcepcionalPayload } from '../services/diaExcepcionalService';

interface DiaExcepcionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenities?: { idAmenity: number; nombre: string }[];
  onSuccess?: () => void;
}

export const DiaExcepcionalModal: React.FC<DiaExcepcionalModalProps> = ({
  isOpen,
  onClose,
  amenities = [],
  onSuccess,
}) => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState<'FERIADO_CIERRA' | 'APERTURA_EXTRAORDINARIA'>('FERIADO_CIERRA');
  const [idAmenity, setIdAmenity] = useState<string>(''); // vacio = todos los amenities
  const [nota, setNota] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha) {
      setErrorMsg('Debe seleccionar una fecha.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: CreateDiaExcepcionalPayload = {
      fecha,
      tipo,
      idAmenity: idAmenity ? Number(idAmenity) : null,
      nota: nota.trim() || undefined,
    };

    try {
      const res = await diaExcepcionalService.create(payload);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.errorMessage || 'Error al registrar el día excepcional.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-3">
          <CalendarOff className="w-6 h-6" />
          <h2 className="text-base font-bold">Registrar Día Excepcional / Feriado (CU-10)</h2>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Defina cierres por feriado o aperturas extraordinarias fuera del horario regular.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Fecha Excepcional *
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Tipo de Excepción *
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium cursor-pointer"
            >
              <option value="FERIADO_CIERRA">Feriado - Cierre de Amenity</option>
              <option value="APERTURA_EXTRAORDINARIA">Apertura Extraordinaria</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Amenity Afectado (Opcional)
            </label>
            <select
              value={idAmenity}
              onChange={(e) => setIdAmenity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium cursor-pointer"
            >
              <option value="">Todos los Amenities del Consorcio</option>
              {amenities.map((a) => (
                <option key={a.idAmenity} value={a.idAmenity}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nota / Motivo (Ej. Año Nuevo, Navidad)
            </label>
            <input
              type="text"
              placeholder="Ej. Feriado Nacional - Cierre Complejo"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar Día Excepcional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
