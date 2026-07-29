'use client';

import React, { useState } from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { AuditLog } from '@/types';
import { Search, ShieldAlert, History, Filter } from 'lucide-react';
import { TimelineModal } from './TimelineModal';

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    idAuditLog: 101,
    usuario: 'admin@consorcio.com',
    accion: 'CREAR_RESERVA',
    entidad: 'Reserva',
    entidadId: 45,
    fechaHora: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    detalle: '{"idAmenity":1,"idUnidad":12,"fechaUso":"2026-08-01","estado":"CONFIRMADA"}'
  },
  {
    idAuditLog: 102,
    usuario: 'guardia@seguridad.com',
    accion: 'CHECKIN_RESERVA',
    entidad: 'Reserva',
    entidadId: 44,
    fechaHora: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    detalle: '{"checkInRealizado":true,"checkInFecha":"2026-07-29T12:00:00Z"}'
  },
  {
    idAuditLog: 103,
    usuario: 'admin@consorcio.com',
    accion: 'REGISTRAR_INCIDENCIA',
    entidad: 'Incidencia',
    entidadId: 12,
    fechaHora: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    detalle: '{"idAmenity":2,"descripcion":"Desperfecto técnico en parrilla","estado":"ABIERTA"}'
  },
  {
    idAuditLog: 104,
    usuario: 'admin@consorcio.com',
    accion: 'RESOLVER_INCIDENCIA',
    entidad: 'Incidencia',
    entidadId: 12,
    fechaHora: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    detalle: '{"costoEstimado":15000,"detalleResolucion":"Se reparó la conexión de gas","estado":"RESUELTA"}'
  },
  {
    idAuditLog: 105,
    usuario: 'admin@consorcio.com',
    accion: 'SANCIONAR_UNIDAD',
    entidad: 'UnidadHabitacional',
    entidadId: 4,
    fechaHora: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    detalle: '{"duracionDias":15,"aplicarSuspension":true,"motivo":"Inasistencias reiteradas no-show"}'
  }
];

export default function AuditLogList() {
  const {
    items,
    totalCount,
    isLoading,
    error,
    page,
    limit,
    searchQuery,
    setPage,
    setLimit,
    setSearchQuery,
  } = useAuditLogs();

  const [timelineTarget, setTimelineTarget] = useState<{ entidad: string; idEntidad: number } | null>(null);

  // Si no hay datos devueltos por el endpoint, usamos el MOCK de prueba
  const displayItems = items && items.length > 0 ? items : MOCK_AUDIT_LOGS;
  const effectiveTotal = items && items.length > 0 ? totalCount : MOCK_AUDIT_LOGS.length;
  const totalPages = Math.ceil(effectiveTotal / limit) || 1;

  const columns: Column<AuditLog>[] = [
    { 
      header: 'Fecha / Hora', 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-extrabold text-xs border border-purple-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {new Date(row.fechaHora).toLocaleDateString()}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {new Date(row.fechaHora).toLocaleTimeString()} hs
            </span>
          </div>
        </div>
      )
    },
    { header: 'Usuario', accessor: (row) => <span className="font-bold text-slate-800 dark:text-slate-100">{row.usuario}</span> },
    { 
      header: 'Acción', 
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
          row.accion.includes('CREAR') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
          row.accion.includes('RESOLVER') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
          row.accion.includes('SANCIONAR') ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
          'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
        }`}>
          {row.accion}
        </span>
      )
    },
    { header: 'Entidad', accessor: (row) => <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300">{row.entidad}</span> },
    { header: 'ID', accessor: (row) => <span className="font-mono text-xs text-slate-500">{row.entidadId}</span> },
    { header: 'Detalle', accessor: (row) => <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[200px] block" title={row.detalle}>{row.detalle}</span> },
    {
      header: 'Línea de Tiempo',
      accessor: (row) => (
        <button
          onClick={() => setTimelineTarget({ entidad: row.entidad, idEntidad: row.entidadId })}
          className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          Ver Timeline (CU-09)
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="pb-2 border-b border-brand-surface-bright/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Registro de Auditoría & Trazabilidad (CU-09)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historial completo de acciones y línea de tiempo de transiciones de estado (EventoAuditoria).
          </p>
        </div>

        <button
          onClick={() => setTimelineTarget({ entidad: 'Reserva', idEntidad: 45 })}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          Ver Demo Timeline de Estados
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción o entidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface-container/40 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Mostrar filas:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-brand-surface-container/60 dark:bg-slate-900 border border-brand-surface-bright/20 dark:border-white/10 rounded-xl px-3 py-1.5 font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
          {error}
        </div>
      )}

      <DataTable
        data={displayItems}
        columns={columns}
        keyExtractor={(row) => row.idAuditLog.toString()}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={
          searchQuery
            ? 'No se encontraron registros para tu búsqueda.'
            : 'No hay registros de auditoría.'
        }
      />

      {/* Modal de Línea de Tiempo */}
      {timelineTarget && (
        <TimelineModal
          isOpen={!!timelineTarget}
          onClose={() => setTimelineTarget(null)}
          entidad={timelineTarget.entidad}
          idEntidad={timelineTarget.idEntidad}
        />
      )}
    </div>
  );
}
