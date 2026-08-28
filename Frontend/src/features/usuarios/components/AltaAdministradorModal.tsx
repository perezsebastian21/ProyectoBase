'use client';

import React, { useState } from 'react';
import { UserPlus, X, Mail, Phone, Building, Send, AlertCircle, Check, Copy } from 'lucide-react';
import { invitacionService } from '@/features/invitaciones/services/invitacionService';
import type { CrearInvitacionAdminDto, InvitacionUsuario } from '@/features/invitaciones/types';

interface AltaAdministradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AltaAdministradorModal: React.FC<AltaAdministradorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [emailDestino, setEmailDestino] = useState<string>('');
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [razonSocial, setRazonSocial] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invitacionCreada, setInvitacionCreada] = useState<InvitacionUsuario | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailDestino.trim()) {
      setErrorMsg('Ingresa el correo electrónico del Administrador.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const dto: CrearInvitacionAdminDto = {
      emailDestino: emailDestino.trim(),
      nombre: nombre.trim() || undefined,
      apellido: apellido.trim() || undefined,
      razonSocial: razonSocial.trim() || undefined,
      telefonoDestino: telefono.trim() || undefined,
    };

    try {
      const res = await invitacionService.crearInvitacionAdmin(dto);
      if (res.success && res.data) {
        setInvitacionCreada(res.data);
        onSuccess?.();
      } else {
        setErrorMsg(res.errorMessage || 'No se pudo registrar la invitación.');
      }
    } catch {
      setErrorMsg('Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkAdmin = invitacionCreada
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/invitacion/${invitacionCreada.token}`
    : '';

  const handleCopyLink = () => {
    if (!linkAdmin) return;
    navigator.clipboard.writeText(linkAdmin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Alta de Administrador</h3>
              <p className="text-xs text-slate-400">Panel de Super Administrador</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {invitacionCreada ? (
            <div className="space-y-4 text-center py-2 animate-fade-in">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">¡Invitación Enviada!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Se ha generado el token de registro para la Administración.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Link de Registro Admin</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={linkAdmin}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono overflow-hidden text-ellipsis"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95"
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Carlos"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Apellido</label>
                  <input
                    type="text"
                    placeholder="González"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Administración *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="admin@administracion.com"
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Razón Social / Administración</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Administración González & Asoc."
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="+54 11..."
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Invitación de Administración</span>
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
