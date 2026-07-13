'use client';

import React from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { AuditLog } from '../types';

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

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const columns: Column<AuditLog>[] = [
    { 
      header: 'Fecha / Hora', 
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--foreground)]">
            {new Date(row.fechaHora).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(row.fechaHora).toLocaleTimeString()}
          </span>
        </div>
      )
    },
    { header: 'Usuario', accessor: 'usuario' },
    { 
      header: 'Acción', 
      accessor: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          row.accion === 'CREATE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          row.accion === 'UPDATE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
          row.accion === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {row.accion}
        </span>
      )
    },
    { header: 'Entidad', accessor: (row) => <span className="font-mono text-xs">{row.entidad}</span> },
    { header: 'ID', accessor: 'entidadId' },
    { header: 'Detalle', accessor: (row) => <span className="text-sm truncate max-w-[200px] block" title={row.detalle}>{row.detalle}</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Registro de Auditoría</h2>
          <p className="text-sm text-gray-500">
            Historial de acciones y cambios en el sistema.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--brand-surface)] p-4 rounded-xl border border-[var(--brand-surface-bright)]">
        <input
          type="text"
          placeholder="Buscar por usuario, acción, entidad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-xs px-4 py-2 rounded-lg border border-[var(--brand-surface-bright)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Mostrar:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-transparent border-none font-medium focus:outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      )}

      <DataTable
        data={items}
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
    </div>
  );
}
