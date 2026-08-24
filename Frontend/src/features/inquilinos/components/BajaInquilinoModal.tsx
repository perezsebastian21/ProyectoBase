'use client';

import React, { useState } from 'react';
import { UserMinus, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { inquilinoService } from '../services/inquilinoService';

interface BajaInquilinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  idInquilino: number;
  nombreInquilino: string;
  identificadorUnidad?: string;
  onSuccess?: () => void;
}

export const BajaInquilinoModal: React.FC<BajaInquilinoModalProps> = ({
  isOpen,
  onClose,
  idInquilino,
  nombreInquilino,
  identificadorUnidad,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await inquilinoService.darDeBaja(idInquilino);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.errorMessage || 'Error al procesar la baja del inquilino.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
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

        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
          <UserMinus className="w-6 h-6" />
          <h2 className="text-base font-bold">Dar de Baja Inquilino (CU-11)</h2>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
          Estás por dar de baja al inquilino <strong className="text-zinc-900 dark:text-zinc-100">{nombreInquilino}</strong>
          {identificadorUnidad && <> perteneciente a la unidad <strong>{identificadorUnidad}</strong></>}.
        </p>

        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1 mb-6">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Consecuencias de la Baja (BR-BAJ-001 / BR-BAJ-002):</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-1 pl-1">
            <li>Se marcará el registro como inactivo (`Activo = false`).</li>
            <li>Se revocarán inmediatamente todos los tokens JWT activos del residente.</li>
            <li>Las reservas futuras permanecerán asociadas a la unidad habitacional.</li>
          </ul>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20"
          >
            <UserMinus className="w-4 h-4" />
            {isSubmitting ? 'Procesando...' : 'Confirmar Baja'}
          </button>
        </div>
      </div>
    </div>
  );
};
