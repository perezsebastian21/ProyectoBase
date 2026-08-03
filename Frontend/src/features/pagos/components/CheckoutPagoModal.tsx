'use client';

import React, { useState } from 'react';
import { CreditCard, Wallet, Landmark, CheckCircle2, AlertCircle, X, ShieldCheck, Receipt } from 'lucide-react';
import { pagoService, PagoRequestPayload, PagoResponseDto } from '../services/pagoService';

interface CheckoutPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  idReserva: number;
  nombreAmenity: string;
  montoTotal?: number;
  monto?: number;
  depositoGarantia?: number;
  onSuccess?: (response: PagoResponseDto) => void;
}

export const CheckoutPagoModal: React.FC<CheckoutPagoModalProps> = ({
  isOpen,
  onClose,
  idReserva,
  nombreAmenity,
  montoTotal,
  monto,
  depositoGarantia = 0,
  onSuccess,
}) => {
  const efectivoMonto = montoTotal ?? monto ?? 0;
  const [metodoPago, setMetodoPago] = useState<'TARJETA' | 'TRANSFERENCIA' | 'BILLETERA_DIGITAL'>('TARJETA');

  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pagoResultado, setPagoResultado] = useState<PagoResponseDto | null>(null);

  if (!isOpen) return null;

  const totalCobrar = efectivoMonto + depositoGarantia;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    // El token de pasarela debe provenir del proveedor de pago real (MercadoPago, etc.)
    // Por ahora se envía un identificador basado en el método seleccionado
    const tokenPasarela = `${metodoPago}_${Date.now()}`;

    const payload: PagoRequestPayload = {
      idReserva,
      metodoPago,
      tokenPasarela,
    };

    try {
      const res = await pagoService.procesarPago(payload);
      if (res.success && res.data) {
        setPagoResultado(res.data);
        if (onSuccess) onSuccess(res.data);
      } else {
        setErrorMsg(res.errorMessage || 'El pago no pudo ser procesado por la pasarela.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error de conexión al procesar el pago. Intente nuevamente.');
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

        {pagoResultado ? (
          /* PAGO EXITOSO */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
              ¡Pago Procesado Exitosamente!
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Reserva <strong>#{idReserva}</strong> — {nombreAmenity}
            </p>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Estado de Reserva:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                  {pagoResultado.estadoReserva}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>N° Comprobante:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                  {pagoResultado.comprobante}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              Aceptar y Cerrar
            </button>
          </div>
        ) : (
          /* FORMULARIO CHECKOUT */
          <>
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-4">
              <CreditCard className="w-6 h-6" />
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Pago de Reserva (CU-07)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Reserva #{idReserva} — {nombreAmenity}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Resumen de Monto */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Tarifa de Uso:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">${efectivoMonto.toLocaleString()}</span>
              </div>
              {depositoGarantia > 0 && (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Depósito Garantía:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">${depositoGarantia.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-indigo-500/20">
                <span>Total a Abonar:</span>
                <span>${totalCobrar.toLocaleString()} ARS</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selector de Método de Pago */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Método de Pago *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'TARJETA', label: 'Tarjeta', icon: CreditCard },
                    { id: 'TRANSFERENCIA', label: 'Transferencia', icon: Landmark },
                    { id: 'BILLETERA_DIGITAL', label: 'Billetera Digital', icon: Wallet },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = metodoPago === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMetodoPago(m.id as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                            : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campos dinámicos según Método */}
              {metodoPago === 'TARJETA' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="4500 0000 0000 0000"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Vencimiento
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        CVC
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {metodoPago === 'TRANSFERENCIA' && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1 font-mono">
                  <div className="text-zinc-500 text-[10px]">CBU / CVU del Consorcio:</div>
                  <div className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">0000003100011223344556</div>
                  <div className="text-zinc-500 text-[10px] pt-1">Alias: CONSORCIO.BELLINI.PAGO</div>
                </div>
              )}

              {metodoPago === 'BILLETERA_DIGITAL' && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs text-center text-zinc-600 dark:text-zinc-400">
                  Al confirmar serás redirigido a MercadoPago / Billetera Digital para autorizar el cobro de <strong>${totalCobrar.toLocaleString()}</strong>.
                </div>
              )}

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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSubmitting ? 'Procesando Pago...' : `Confirmar Pago ($${totalCobrar.toLocaleString()})`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
