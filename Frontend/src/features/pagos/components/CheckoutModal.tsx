'use client';

import React, { useState } from 'react';
import { CreditCard, DollarSign, X, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { pagoService } from '../services/pagoService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  idReserva: number;
  nombreAmenity: string;
  monto: number;
  onSuccess?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  idReserva,
  nombreAmenity,
  monto,
  onSuccess,
}) => {
  const [metodoPago, setMetodoPago] = useState<'TARJETA' | 'TRANSFERENCIA' | 'BILLETERA_DIGITAL'>('TARJETA');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePagar = (e: React.FormEvent) => {
    e.preventDefault();

    // Instrucción explícita del usuario: "Por el momento en el boton de pagar genera un alert para decir que se esta trabajando en la modalidad del pago"
    alert('Se está trabajando en la modalidad del pago.');

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
          <CreditCard className="w-6 h-6" />
          <h2 className="text-lg font-bold">Pago de Reserva (CU-07)</h2>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 my-4 space-y-1">
          <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold uppercase">
            Reserva #{idReserva}
          </div>
          <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {nombreAmenity}
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 pt-1">
            ${monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <form onSubmit={handlePagar} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Seleccionar Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetodoPago('TARJETA')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  metodoPago === 'TARJETA'
                    ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Tarjeta</span>
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('TRANSFERENCIA')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  metodoPago === 'TRANSFERENCIA'
                    ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <DollarSign className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Transferencia</span>
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('BILLETERA_DIGITAL')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  metodoPago === 'BILLETERA_DIGITAL'
                    ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Lock className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Billetera</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Transacción segura y encriptada mediante la pasarela integrada.</span>
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-md flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pagar Ahora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
