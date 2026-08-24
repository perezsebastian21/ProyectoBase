'use client';

import React, { useState } from 'react';
import { useUnidades } from '../hooks/useUnidades';
import UnidadFormModal from './UnidadFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import type { UnidadHabitacional } from '../types';
import { 
  Search, 
  Home as HomeIcon, 
  Building2, 
  LayoutGrid, 
  List, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  ShieldAlert,
  Edit2,
  Trash2
} from 'lucide-react';

export default function UnidadList() {
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
    
    complejos,
    isLoadingComplejos,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedUnidad,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createUnidad,
    updateUnidad,
    deleteUnidad,
  } = useUnidades();

  // Switch de vista: 'matrix' o 'table'
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedUnidad) {
      return updateUnidad(payload);
    } else {
      return createUnidad(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUnidad) {
      await deleteUnidad(selectedUnidad.idUnidadHabitacional);
    }
  };

  // Métricas dinámicas de unidades
  const habilitadasCount = items.filter((u) => u.estadoUnidad === 'HABILITADA').length;
  const deudoresCount = items.filter((u) => u.debeExpensas).length;
  const infraccionesTotal = items.reduce((acc, u) => acc + (u.contadorInfracciones || 0), 0);

  const columns: Column<UnidadHabitacional>[] = [
    { 
      header: 'Identificador', 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-brand-primary dark:text-blue-400 flex items-center justify-center font-extrabold text-xs border border-blue-500/20">
            <HomeIcon className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100">{row.identificador}</span>
        </div>
      )
    },
    { 
      header: 'Complejo', 
      accessor: (row) => <span className="font-semibold text-brand-primary dark:text-blue-400">{row.nombreComplejo}</span> 
    },
    { 
      header: 'Estado', 
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
          row.estadoUnidad === 'HABILITADA' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
          row.estadoUnidad === 'EN_MANTENIMIENTO' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
          'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
        }`}>
          {row.estadoUnidad}
        </span>
      )
    },
    { 
      header: 'Expensas', 
      accessor: (row) => (
        row.debeExpensas ? (
          <span className="text-red-500 font-bold">Debe (${row.saldoActual})</span>
        ) : (
          <span className="text-emerald-500 font-bold">Al día</span>
        )
      )
    },
    { header: 'Infracciones', accessor: (row) => <span className="text-slate-600 dark:text-slate-300 font-semibold">{row.contadorInfracciones}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-surface-bright/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Unidades Habitacionales & Residentes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Padrón de departamentos, lotes y legajo de residentes del consorcio.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Switch de Vista: Matriz vs Tabla */}
          <div className="p-1 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Matriz de Edificio
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

          <CreateButton label="Nueva Unidad" onClick={handleOpenCreate} />
        </div>
      </div>

      {/* KPI Cards de Unidades */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-blue-500/20 backdrop-blur-md flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-blue-400">Total Unidades</div>
            <div className="text-xl font-black text-white">{totalCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-emerald-400">Habilitadas</div>
            <div className="text-xl font-black text-white">{habilitadasCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-red-500/20 backdrop-blur-md flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-red-400">Deudores Expensas</div>
            <div className="text-xl font-black text-white">{deudoresCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-md flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-amber-400">Infracciones</div>
            <div className="text-xl font-black text-white">{infraccionesTotal}</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar unidad por identificador..."
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
          keyExtractor={(row) => row.idUnidadHabitacional.toString()}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage={
            searchQuery
              ? 'No se encontraron unidades para tu búsqueda.'
              : 'No hay unidades registradas.'
          }
        />
      ) : (
        /* VISTA MATRIZ DE EDIFICIO / UNIDADES */
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-2 border border-dashed border-white/10 rounded-3xl">
              <HomeIcon className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No hay unidades registradas en el complejo seleccionado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((unidad) => {
                const isDeudor = unidad.debeExpensas;
                const statusBorder = isDeudor
                  ? 'border-red-500/30 hover:border-red-500/60'
                  : 'border-white/10 hover:border-blue-500/40';

                return (
                  <div
                    key={unidad.idUnidadHabitacional}
                    className={`p-5 rounded-3xl bg-slate-950/80 border ${statusBorder} transition-all space-y-3 shadow-lg backdrop-blur-md relative group`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400 flex items-center justify-center font-extrabold text-xs border border-blue-500/20">
                          <HomeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{unidad.identificador}</h4>
                          <span className="text-[11px] text-slate-400">{unidad.nombreComplejo}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(unidad)}
                          className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(unidad)}
                          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Estado Unidad:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          unidad.estadoUnidad === 'HABILITADA'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {unidad.estadoUnidad}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Expensas:</span>
                        {isDeudor ? (
                          <span className="text-red-400 font-extrabold text-[11px]">
                            Debe (${unidad.saldoActual})
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold text-[11px]">
                            Al día
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Infracciones:</span>
                        <span className="font-mono text-slate-300 font-semibold">
                          {unidad.contadorInfracciones || 0} registradas
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Formulario */}
      <UnidadFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedUnidad}
        complejos={complejos}
        isLoadingComplejos={isLoadingComplejos}
        isSubmitLoading={isSubmitLoading}
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
            ¿Estás seguro de que deseas eliminar esta unidad habitacional?
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
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar Unidad'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
