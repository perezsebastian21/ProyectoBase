'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  User,
  Building2,
  Home,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Check,
} from 'lucide-react';
import { usuarioUnidadService } from '../services/usuarioUnidadService';
import type { UsuarioUnidadPendienteDto } from '@/features/invitaciones/types';

interface AprobacionVinculacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AprobacionVinculacionesModal: React.FC<AprobacionVinculacionesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [pendientes, setPendientes] = useState<UsuarioUnidadPendienteDto[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPendientes = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await usuarioUnidadService.obtenerPendientes();
      if (res.success && res.data) {
        setPendientes(res.data);
      } else {
        setErrorMsg(res.errorMessage || 'No se pudieron cargar las solicitudes pendientes.');
      }
    } catch {
      setErrorMsg('Error de conexión al cargar las solicitudes pendientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPendientes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAprobar = async (item: UsuarioUnidadPendienteDto) => {
    setProcessingId(item.idUsuarioUnidad);
    setFeedbackMsg(null);
    try {
      const res = await usuarioUnidadService.aprobarVinculacion(item.idUsuarioUnidad);
      if (res.success) {
        setPendientes((prev) => prev.filter((p) => p.idUsuarioUnidad !== item.idUsuarioUnidad));
        setFeedbackMsg(`La vinculación de ${item.nombreCompleto} (${item.identificadorUnidad}) fue APROBADA.`);
        onSuccess?.();
      }
    } catch {
      setFeedbackMsg('Error al aprobar la vinculación.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazar = async (item: UsuarioUnidadPendienteDto) => {
    setProcessingId(item.idUsuarioUnidad);
    setFeedbackMsg(null);
    try {
      const res = await usuarioUnidadService.rechazarVinculacion(item.idUsuarioUnidad, 'Documentación inconsistente');
      if (res.success) {
        setPendientes((prev) => prev.filter((p) => p.idUsuarioUnidad !== item.idUsuarioUnidad));
        setFeedbackMsg(`La solicitud de ${item.nombreCompleto} ha sido RECHAZADA.`);
        onSuccess?.();
      }
    } catch {
      setFeedbackMsg('Error al rechazar la vinculación.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Aprobación de Propietarios</h2>
              <p className="text-xs text-slate-400">Solicitudes de vinculación de unidades habitacionales</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {feedbackMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
              Cargando solicitudes pendientes...
            </div>
          ) : pendientes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
              <p className="text-sm font-bold text-white">¡No hay solicitudes pendientes!</p>
              <p className="text-xs text-slate-500">Todas las vinculaciones de propietario están al día.</p>
            </div>
          ) : (
            pendientes.map((item) => (
              <div
                key={item.idUsuarioUnidad}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.nombreCompleto}</h4>
                      <p className="text-xs text-slate-400">{item.email}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    Pendiente Admin
                  </span>
                </div>

                {/* Detalles de la Unidad */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Home className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="font-bold text-white">{item.identificadorUnidad}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{item.nombreConsorcio}</span>
                  </div>

                  {item.dni && (
                    <div className="text-[11px] text-slate-400">
                      DNI: <strong className="text-slate-200">{item.dni}</strong>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400">
                    Ocupación: <strong className={item.esOcupanteActual ? 'text-emerald-400' : 'text-purple-400'}>
                      {item.esOcupanteActual ? 'Habita la propiedad' : 'Alquila / Ausente'}
                    </strong>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAprobar(item)}
                    disabled={processingId === item.idUsuarioUnidad}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar Titularidad</span>
                  </button>

                  <button
                    onClick={() => handleRechazar(item)}
                    disabled={processingId === item.idUsuarioUnidad}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
