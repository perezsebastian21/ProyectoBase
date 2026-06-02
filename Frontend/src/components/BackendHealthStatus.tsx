'use client';

import React from 'react';
import { useBackendHealth } from '@/hooks/useBackendHealth';

export default function BackendHealthStatus() {
  const {
    status,
    latency,
    lastChecked,
    errorMessage,
    data,
    checkHealthStatus,
  } = useBackendHealth();

  const getStatusColor = () => {
    switch (status) {
      case 'alive':
        return 'from-emerald-500 to-teal-600';
      case 'error':
        return 'from-rose-500 to-orange-600';
      case 'loading':
        return 'from-indigo-500 to-cyan-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusGlow = () => {
    switch (status) {
      case 'alive':
        return 'shadow-emerald-500/20 border-emerald-500/30';
      case 'error':
        return 'shadow-rose-500/20 border-rose-500/30';
      case 'loading':
        return 'shadow-indigo-500/20 border-indigo-500/30';
      default:
        return 'shadow-slate-500/20 border-slate-500/30';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'alive':
        return 'Backend En Línea';
      case 'error':
        return 'Backend Desconectado';
      case 'loading':
        return 'Verificando Conexión...';
      default:
        return 'Estado Desconocido';
    }
  };

  return (
    <div className={`w-full p-6 rounded-2xl border bg-brand-surface-container/60 dark:bg-slate-900/60 border-brand-surface-bright/20 dark:border-white/5 backdrop-blur-xl shadow-xl transition-all duration-300 ${getStatusGlow()}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Indicador de Pulso y Estado */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-brand-surface/80 dark:bg-slate-800/80 border border-brand-surface-bright/20 dark:border-white/5">
            <span className={`absolute inline-flex h-4 w-4 rounded-full bg-gradient-to-tr ${getStatusColor()} opacity-75 ${status === 'loading' ? 'animate-ping' : ''}`}></span>
            {status === 'alive' && (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 animate-pulse"></span>
            )}
            {status === 'error' && (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            )}
            {status === 'loading' && (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            )}
            {status === 'idle' && (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500"></span>
            )}
          </div>

          <div className="text-left">
            <h4 className="font-bold text-base leading-tight text-slate-800 dark:text-white flex items-center gap-2">
              {getStatusLabel()}
              {status === 'alive' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Activo
                </span>
              )}
              {status === 'error' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  Fallo
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug truncate max-w-[240px]" title={process.env.NEXT_PUBLIC_BACKEND_URL}>
              {process.env.NEXT_PUBLIC_BACKEND_URL || 'https://proyectobase-i6yv.onrender.com'}
            </p>
          </div>
        </div>

        {/* Botón de Actualizar / Refrescar */}
        <button
          onClick={checkHealthStatus}
          disabled={status === 'loading'}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-surface-bright/10 dark:bg-white/5 border border-brand-surface-bright/20 dark:border-white/5 hover:bg-brand-surface-bright/20 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          aria-label="Refrescar estado de salud"
        >
          <svg
            className={`w-5 h-5 ${status === 'loading' ? 'animate-spin text-indigo-400' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>

      {/* Panel de Detalles */}
      <div className="mt-4 pt-4 border-t border-brand-surface-bright/20 dark:border-white/5 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-brand-surface/40 dark:bg-slate-950/40 border border-brand-surface-bright/20 dark:border-white/5">
            <span className="block text-slate-500 dark:text-slate-400 font-medium">Ping / Latencia</span>
            <span className={`block text-lg font-bold mt-0.5 ${latency !== null ? (latency < 150 ? 'text-emerald-500 dark:text-emerald-400' : latency < 350 ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400') : 'text-slate-500'}`}>
              {latency !== null ? `${latency} ms` : '—'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-brand-surface/40 dark:bg-slate-950/40 border border-brand-surface-bright/20 dark:border-white/5">
            <span className="block text-slate-500 dark:text-slate-400 font-medium">Último Chequeo</span>
            <span className="block text-slate-700 dark:text-slate-200 font-semibold mt-1">
              {lastChecked ? lastChecked.toLocaleTimeString() : 'Nunca'}
            </span>
          </div>
        </div>

        {/* Desglose de error */}
        {status === 'error' && errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-200 text-xs space-y-1 text-left animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="font-bold flex items-center gap-1">
              <span>⚠️</span> Detalle del error:
            </p>
            <p className="font-mono text-[11px] opacity-90 break-words bg-slate-950/30 p-2 rounded border border-white/5">
              {errorMessage}
            </p>
            <p className="text-[10px] text-rose-600 dark:text-rose-300/80 italic mt-1.5">
              Tip: Revisa que la URL esté configurada correctamente en .env.local o que el servidor backend esté encendido y acepte CORS.
            </p>
          </div>
        )}

        {/* Datos extras en Success */}
        {status === 'alive' && data && (
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] space-y-1 text-left animate-in fade-in duration-200">
            <p className="font-semibold text-slate-600 dark:text-slate-300">Respuesta del Backend:</p>
            <pre className="font-mono p-2 rounded bg-slate-950/30 border border-white/5 overflow-x-auto text-[10px] text-emerald-600 dark:text-emerald-400">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
