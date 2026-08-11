'use client';

import React, { useState } from 'react';
import {
  Building2,
  Send,
  QrCode,
  Copy,
  Check,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Share2,
  Sparkles,
} from 'lucide-react';
import { invitacionService } from '../services/invitacionService';
import type { CrearInvitacionesMasivasDto } from '../types';

interface UnidadEstadoItem {
  idUnidadHabitacional: number;
  identificador: string;
  pisoTorre?: string;
  estado: 'REGISTRADO' | 'INVITADO' | 'SIN_INVITAR';
  emailResidente?: string;
  nombreResidente?: string;
  tipoRelacion?: 'PROPIETARIO' | 'INQUILINO';
}

interface GestionInvitacionesAdminProps {
  isOpen: boolean;
  onClose: () => void;
  idConsorcio: number;
  nombreConsorcio?: string;
}

export const GestionInvitacionesAdmin: React.FC<GestionInvitacionesAdminProps> = ({
  isOpen,
  onClose,
  idConsorcio,
  nombreConsorcio = 'Consorcio Las Heras',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Lista simulada de unidades del edificio con sus badges de estado
  const [unidades, setUnidades] = useState<UnidadEstadoItem[]>([
    { idUnidadHabitacional: 1, identificador: 'Depto 1º A', pisoTorre: 'Piso 1', estado: 'REGISTRADO', nombreResidente: 'Juan Pérez', emailResidente: 'juan.perez@ejemplo.com', tipoRelacion: 'PROPIETARIO' },
    { idUnidadHabitacional: 2, identificador: 'Depto 1º B', pisoTorre: 'Piso 1', estado: 'INVITADO', emailResidente: 'residente1b@ejemplo.com' },
    { idUnidadHabitacional: 3, identificador: 'Depto 2º A', pisoTorre: 'Piso 2', estado: 'SIN_INVITAR' },
    { idUnidadHabitacional: 4, identificador: 'Depto 2º B', pisoTorre: 'Piso 2', estado: 'REGISTRADO', nombreResidente: 'Mariana López', emailResidente: 'mariana.lopez@ejemplo.com', tipoRelacion: 'INQUILINO' },
    { idUnidadHabitacional: 5, identificador: 'Depto 3º A', pisoTorre: 'Piso 3', estado: 'SIN_INVITAR' },
    { idUnidadHabitacional: 6, identificador: 'Depto 3º B', pisoTorre: 'Piso 3', estado: 'INVITADO', emailResidente: 'residente3b@ejemplo.com' },
    { idUnidadHabitacional: 7, identificador: 'Depto 4º A', pisoTorre: 'Piso 4', estado: 'SIN_INVITAR' },
    { idUnidadHabitacional: 8, identificador: 'Depto 4º B', pisoTorre: 'Piso 4', estado: 'REGISTRADO', nombreResidente: 'Carlos Gómez', emailResidente: 'carlos.gomez@ejemplo.com', tipoRelacion: 'PROPIETARIO' },
  ]);

  if (!isOpen) return null;

  const linkGeneralEdificio = `${typeof window !== 'undefined' ? window.location.origin : ''}/invitacion/link-edificio-${idConsorcio}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkGeneralEdificio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnviarMasivas = async () => {
    setIsSubmitting(true);
    setFeedbackMsg(null);

    const pendientes = unidades.filter((u) => u.estado === 'SIN_INVITAR');
    const dto: CrearInvitacionesMasivasDto = {
      idConsorcio,
      unidades: pendientes.map((u) => ({
        idUnidadHabitacional: u.idUnidadHabitacional,
        identificador: u.identificador,
        emailDestino: u.emailResidente || `residente.${u.identificador.toLowerCase().replace(/\s+/g, '')}@consorcio.com`,
      })),
    };

    try {
      const res = await invitacionService.crearInvitacionesMasivas(dto);
      if (res.success) {
        setUnidades((prev) =>
          prev.map((u) => (u.estado === 'SIN_INVITAR' ? { ...u, estado: 'INVITADO' } : u))
        );
        setFeedbackMsg(`Se enviaron ${dto.unidades?.length || 1} invitaciones masivas con éxito.`);
      }
    } catch {
      setFeedbackMsg('Error al enviar las invitaciones masivas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const unidadesFiltradas = unidades.filter(
    (u) =>
      u.identificador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nombreResidente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.emailResidente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const registradosCount = unidades.filter((u) => u.estado === 'REGISTRADO').length;
  const invitadosCount = unidades.filter((u) => u.estado === 'INVITADO').length;
  const sinInvitarCount = unidades.filter((u) => u.estado === 'SIN_INVITAR').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gestión de Invitaciones por Edificio</h2>
              <p className="text-xs text-slate-400">{nombreConsorcio}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tarjeta Enlace QR / Copiar */}
          <div className="bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-slate-900 border border-blue-500/20 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  Enlace Abierto de Registro
                </span>
                <h3 className="text-sm font-bold text-white mt-1">Código QR / Link del Consorcio</h3>
                <p className="text-xs text-slate-400">
                  Los residentes pueden escanear el QR en la entrada o ingresar con este link.
                </p>
              </div>

              <div className="w-12 h-12 bg-white p-1 rounded-xl flex items-center justify-center flex-shrink-0">
                <QrCode className="w-9 h-9 text-slate-950" />
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={linkGeneralEdificio}
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono overflow-hidden text-ellipsis"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Badges de Resumen */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-emerald-400">{registradosCount}</div>
              <div className="text-[10px] font-bold uppercase text-emerald-300 mt-0.5">🟢 Registrados</div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-amber-400">{invitadosCount}</div>
              <div className="text-[10px] font-bold uppercase text-amber-300 mt-0.5">🟡 Invitados</div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-red-400">{sinInvitarCount}</div>
              <div className="text-[10px] font-bold uppercase text-red-300 mt-0.5">🔴 Sin Invitar</div>
            </div>
          </div>

          {/* Feedback mensaje */}
          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Barra de Búsqueda y Enviar Masivo */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar unidad o residente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleEnviarMasivas}
              disabled={isSubmitting || sinInvitarCount === 0}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Invitaciones Masivas ({sinInvitarCount})</span>
            </button>
          </div>

          {/* Grilla / Mapa de Unidades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unidadesFiltradas.map((u) => (
              <div
                key={u.idUnidadHabitacional}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{u.identificador}</span>
                    <span className="text-[10px] text-slate-500">({u.pisoTorre})</span>
                  </div>

                  {u.nombreResidente ? (
                    <div className="text-xs text-slate-300 font-medium mt-0.5">
                      {u.nombreResidente} <span className="text-[10px] text-blue-400">({u.tipoRelacion})</span>
                    </div>
                  ) : u.emailResidente ? (
                    <div className="text-xs text-slate-400 mt-0.5">{u.emailResidente}</div>
                  ) : (
                    <div className="text-xs text-slate-500 italic mt-0.5">Sin email asignado</div>
                  )}
                </div>

                {/* Badge de Estado */}
                {u.estado === 'REGISTRADO' && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Activo</span>
                  </span>
                )}

                {u.estado === 'INVITADO' && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Enviado</span>
                  </span>
                )}

                {u.estado === 'SIN_INVITAR' && (
                  <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Pendiente</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
