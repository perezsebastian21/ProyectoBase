'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  Shield,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { rolService } from '../services/rolService';
import type { Rol } from '../types';

interface GestionRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  idUsuario: number;
  username: string;
}

const ROL_COLOR: Record<string, string> = {
  SUPER_ADMINISTRADOR:    'from-red-600 to-rose-600',
  ADMINISTRADOR_AVANZADO: 'from-purple-600 to-violet-600',
  ADMINISTRADOR_LIVIANO:  'from-indigo-600 to-blue-600',
  GUARDIA:                'from-amber-500 to-yellow-500',
  PROPIETARIO:            'from-emerald-600 to-teal-600',
  INQUILINO:              'from-cyan-600 to-sky-600',
  INVITADO:               'from-slate-500 to-slate-600',
};

export const GestionRolesModal: React.FC<GestionRolesModalProps> = ({
  isOpen,
  onClose,
  idUsuario,
  username,
}) => {
  const [catalogo, setCatalogo] = useState<Rol[]>([]);
  const [rolesAsignados, setRolesAsignados] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [resCatalogo, resRoles] = await Promise.all([
        rolService.getCatalogo(),
        rolService.getRolesDeUsuario(idUsuario),
      ]);

      if (resCatalogo.success && resCatalogo.data) {
        setCatalogo(resCatalogo.data);
      } else {
        setErrorMsg(resCatalogo.errorMessage || 'No se pudo cargar el catálogo de roles.');
      }

      if (resRoles.success && resRoles.data) {
        setRolesAsignados(resRoles.data);
      } else {
        setErrorMsg(resRoles.errorMessage || 'No se pudieron cargar los roles del usuario.');
      }
    } catch {
      setErrorMsg('Error de conexión al cargar los roles.');
    } finally {
      setIsLoading(false);
    }
  }, [idUsuario]);

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      cargarDatos();
    }
  }, [isOpen, cargarDatos]);

  if (!isOpen) return null;

  const tieneRol = (idRol: number) => rolesAsignados.some((r) => r.idRol === idRol);

  const handleAsignar = async (rol: Rol) => {
    setProcessingId(rol.idRol);
    setFeedback(null);
    try {
      const res = await rolService.asignarRol(idUsuario, { idRol: rol.idRol });
      if (res.success) {
        setRolesAsignados((prev) => [...prev, rol]);
        setFeedback(`Rol "${rol.nombre}" asignado correctamente.`);
      } else {
        setFeedback(`⚠ ${res.errorMessage || 'No se pudo asignar el rol.'}`);
      }
    } catch {
      setFeedback('⚠ Error de conexión al asignar el rol.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemover = async (rol: Rol) => {
    setProcessingId(rol.idRol);
    setFeedback(null);
    try {
      const res = await rolService.removerRol(idUsuario, rol.idRol);
      if (res.success) {
        setRolesAsignados((prev) => prev.filter((r) => r.idRol !== rol.idRol));
        setFeedback(`Rol "${rol.nombre}" removido correctamente.`);
      } else {
        setFeedback(`⚠ ${res.errorMessage || 'No se pudo remover el rol.'}`);
      }
    } catch {
      setFeedback('⚠ Error de conexión al remover el rol.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gestión de Roles</h3>
              <p className="text-xs text-slate-400 font-mono">@{username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">

          {/* Feedback */}
          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              feedback.startsWith('⚠')
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              {feedback.startsWith('⚠') ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
              <span>{feedback.replace('⚠ ', '')}</span>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span>Cargando roles...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {catalogo.map((rol) => {
                const asignado = tieneRol(rol.idRol);
                const loading = processingId === rol.idRol;
                const gradiente = ROL_COLOR[rol.codigo] || 'from-slate-500 to-slate-600';

                return (
                  <div
                    key={rol.idRol}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      asignado
                        ? 'bg-slate-800/60 border-slate-700'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-70 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradiente} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{rol.nombre}</p>
                        <p className="text-[11px] text-slate-400">{rol.descripcion}</p>
                      </div>
                    </div>

                    {asignado ? (
                      <button
                        onClick={() => handleRemover(rol)}
                        disabled={loading}
                        title="Remover rol"
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAsignar(rol)}
                        disabled={loading}
                        title="Asignar rol"
                        className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
