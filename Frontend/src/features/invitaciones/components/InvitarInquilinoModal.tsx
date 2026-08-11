'use client';

import React, { useState } from 'react';
import { UserPlus, X, Mail, Phone, Home, Copy, Check, Send, Sparkles, AlertCircle } from 'lucide-react';
import { invitacionService } from '../services/invitacionService';
import type { CrearInvitacionInquilinoDto, InvitacionUsuario } from '../types';

interface InvitarInquilinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  idUnidadHabitacional: number;
  identificadorUnidad: string;
}

export const InvitarInquilinoModal: React.FC<InvitarInquilinoModalProps> = ({
  isOpen,
  onClose,
  idUnidadHabitacional,
  identificadorUnidad,
}) => {
  const [emailDestino, setEmailDestino] = useState<string>('');
  const [nombreDestino, setNombreDestino] = useState<string>('');
  const [telefonoDestino, setTelefonoDestino] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invitacionGenerada, setInvitacionGenerada] = useState<InvitacionUsuario | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailDestino.trim()) {
      setErrorMsg('Ingresa el correo electrónico del inquilino.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const dto: CrearInvitacionInquilinoDto = {
      idUnidadHabitacional,
      emailDestino: emailDestino.trim(),
      nombreDestino: nombreDestino.trim() || undefined,
      telefonoDestino: telefonoDestino.trim() || undefined,
    };

    try {
      const res = await invitacionService.crearInvitacionInquilino(dto);
      if (res.success && res.data) {
        setInvitacionGenerada(res.data);
      } else {
        setErrorMsg(res.errorMessage || 'No se pudo generar la invitación.');
      }
    } catch {
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkInvitacion = invitacionGenerada
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/invitacion/${invitacionGenerada.token}`
    : '';

  const handleCopyLink = () => {
    if (!linkInvitacion) return;
    navigator.clipboard.writeText(linkInvitacion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Invitar Inquilino</h3>
              <p className="text-xs text-slate-400">Unidad {identificadorUnidad}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {invitacionGenerada ? (
            <div className="space-y-4 text-center py-2 animate-fade-in">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">¡Invitación Creada!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tu inquilino podrá registrarse y tener acceso directo como residente <strong className="text-emerald-400">VIGENTE</strong> sin requerir autorización previa.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Link de Invitación</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={linkInvitacion}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono overflow-hidden text-ellipsis"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre del Inquilino (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Ana Martínez"
                  value={nombreDestino}
                  onChange={(e) => setNombreDestino(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email del Inquilino *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="inquilino@ejemplo.com"
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">WhatsApp / Teléfono (Opcional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="+54 11 1234-5678"
                    value={telefonoDestino}
                    onChange={(e) => setTelefonoDestino(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Generando enlace...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generar Invitación de Inquilino</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
