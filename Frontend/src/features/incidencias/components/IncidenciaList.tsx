'use client';

import React, { useState } from 'react';
import { useIncidencias } from '../hooks/useIncidencias';
import IncidenciaFormModal from './IncidenciaFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import type { Incidencia } from '../types';
import { 
  Search, 
  AlertTriangle, 
  LayoutGrid, 
  List, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign,
  Building,
  Edit2,
  Trash2
} from 'lucide-react';

export default function IncidenciaList() {
  const {
    items,
    totalCount,
    isLoading,
    isSubmitLoading,
    error,
    page,
    limit,
    searchQuery,
    setPage,
    setLimit,
    setSearchQuery,
    
    amenities,
    unidades,
    complejoActivo,
    isLoadingDependencies,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedIncidencia,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createIncidencia,
    updateIncidencia,
    deleteIncidencia,
  } = useIncidencias();

  // Estado de vista: 'table' o 'kanban'
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedIncidencia) {
      return updateIncidencia(payload);
    } else {
      return createIncidencia(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedIncidencia) {
      await deleteIncidencia(selectedIncidencia.idIncidencia);
    }
  };

  const handleQuickStatusChange = async (incidencia: Incidencia, newStatus: string) => {
    await updateIncidencia({
      idIncidencia: incidencia.idIncidencia,
      idAmenity: incidencia.idAmenity,
      idUnidadHabitacional: incidencia.idUnidadHabitacional,
      descripcion: incidencia.descripcion,
      costoEstimado: incidencia.costoEstimado,
      estado: newStatus,
    });
  };

  const columns: Column<Incidencia>[] = [
    { 
      header: 'Reporte', 
      accessor: (row) => {
        const date = row.fechaReporte ? new Date(row.fechaReporte).toLocaleDateString() : '';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-red-500/20 text-amber-500 flex items-center justify-center font-extrabold text-xs border border-amber-500/20 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 dark:text-slate-100">{row.nombreAmenity}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{date}</span>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Unidad', 
      accessor: (row) => <span className="font-semibold text-brand-primary dark:text-blue-400">{row.nombreUnidad}</span> 
    },
    { 
      header: 'Descripción', 
      accessor: (row) => <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[200px] block" title={row.descripcion}>{row.descripcion}</span>
    },
    { 
      header: 'Costo Est.', 
      accessor: (row) => row.costoEstimado ? <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">${row.costoEstimado}</span> : <span className="text-slate-400">-</span>
    },
    { 
      header: 'Estado', 
      accessor: (row) => {
        let colors = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        if (row.estado === 'RESUELTA') colors = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        if (row.estado === 'REPORTADA' || row.estado === 'EN_REVISION') colors = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        if (row.estado === 'EN_REPARACION') colors = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        if (row.estado === 'DESCARTADA') colors = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';

        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors}`}>
            {row.estado}
          </span>
        );
      }
    },
  ];

  // Columnas Kanban
  const kanbanColumns = [
    { id: 'REPORTADA', title: 'Reportadas', color: 'border-amber-500/40 bg-amber-500/5 text-amber-500' },
    { id: 'EN_REVISION', title: 'En Revisión', color: 'border-blue-500/40 bg-blue-500/5 text-blue-400' },
    { id: 'EN_REPARACION', title: 'En Reparación', color: 'border-purple-500/40 bg-purple-500/5 text-purple-400' },
    { id: 'RESUELTA', title: 'Resueltas', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-surface-bright/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Incidencias & Tareas de Mantenimiento
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gestión y seguimiento operativo de roturas y reparaciones del consorcio.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Switch de Vista: Tabla vs Kanban */}
          <div className="p-1 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Tablero Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Vista Tabla
            </button>
          </div>

          <CreateButton label="Nueva Incidencia" onClick={handleOpenCreate} />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descripción, amenity o unidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface-container/40 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
          />
        </div>
        
        {viewMode === 'table' && (
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
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* RENDER SEGÚN VIEW MODE */}
      {viewMode === 'table' ? (
        <DataTable
          data={items}
          columns={columns}
          keyExtractor={(row) => row.idIncidencia.toString()}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage={
            searchQuery
              ? 'No se encontraron incidencias para tu búsqueda.'
              : 'No hay incidencias reportadas.'
          }
        />
      ) : (
        /* VISTA TABLERO KANBAN */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colItems = items.filter((inc) => inc.estado === col.id);
            return (
              <div
                key={col.id}
                className="rounded-3xl border border-white/10 bg-slate-900/40 p-4 space-y-3 backdrop-blur-md min-h-[400px] flex flex-col"
              >
                {/* Column Header */}
                <div className={`p-3 rounded-2xl border ${col.color} flex items-center justify-between font-bold text-xs uppercase tracking-wider`}>
                  <span>{col.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-950/80 text-white text-[11px]">
                    {colItems.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colItems.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                      Sin incidencias en esta columna
                    </div>
                  ) : (
                    colItems.map((inc) => (
                      <div
                        key={inc.idIncidencia}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-blue-500/40 transition-all space-y-3 shadow-md group relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white leading-snug line-clamp-2">
                            {inc.descripcion}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEdit(inc)}
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(inc)}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Building className="w-3.5 h-3.5 text-blue-400" />
                            <span>{inc.nombreAmenity || 'Área Común'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-brand-primary dark:text-blue-400 font-semibold">
                              {inc.nombreUnidad || 'Unidad'}
                            </span>
                            {inc.costoEstimado && (
                              <span className="font-mono text-emerald-400 font-bold">
                                ${inc.costoEstimado}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Kanban Actions */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1 text-[10px]">
                          {col.id === 'REPORTADA' && (
                            <button
                              onClick={() => handleQuickStatusChange(inc, 'EN_REVISION')}
                              className="w-full py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Revisar</span> <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {col.id === 'EN_REVISION' && (
                            <button
                              onClick={() => handleQuickStatusChange(inc, 'EN_REPARACION')}
                              className="w-full py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>En Reparación</span> <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {col.id === 'EN_REPARACION' && (
                            <button
                              onClick={() => handleQuickStatusChange(inc, 'RESUELTA')}
                              className="w-full py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" /> <span>Resolver</span>
                            </button>
                          )}
                          {col.id === 'RESUELTA' && (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 mx-auto">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completado
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Formulario */}
      <IncidenciaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedIncidencia}
        amenities={amenities}
        unidades={unidades}
        isLoadingDependencies={isLoadingDependencies}
        isSubmitLoading={isSubmitLoading}
        complejoActivo={complejoActivo ?? null}
      />

      {/* Modal Eliminar */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmar eliminación"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ¿Estás seguro de que deseas eliminar esta incidencia del registro?
          </p>
          <div className="flex gap-3 pt-4 border-t border-brand-surface-bright/10 dark:border-white/5">
            <button
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-brand-surface-bright/20 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-surface-container cursor-pointer transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isSubmitLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 active:scale-95 cursor-pointer shadow-md shadow-red-500/20 transition-all"
            >
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar Incidencia'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
