'use client';

import React from 'react';
import { useListasEspera } from '../hooks/useListasEspera';
import ListaEsperaFormModal from './ListaEsperaFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import type { ListaEspera } from '../types';
import { Search, Clock } from 'lucide-react';

export default function ListaEsperaList() {
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
    isLoadingDependencies,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedLista,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createLista,
    updateLista,
    deleteLista,
  } = useListasEspera();

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedLista) {
      return updateLista(payload);
    } else {
      return createLista(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedLista) {
      await deleteLista(selectedLista.idListaEspera);
    }
  };

  const columns: Column<ListaEspera>[] = [
    { 
      header: 'Fecha / Horario Deseado', 
      accessor: (row) => {
        const date = new Date(row.fechaUso).toLocaleDateString();
        const start = row.horaInicio.slice(0, 5);
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-brand-primary dark:text-blue-400 flex items-center justify-center font-extrabold text-xs border border-blue-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 dark:text-slate-100">{date}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{start} hs</span>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Amenity', 
      accessor: (row) => <span className="font-bold text-slate-800 dark:text-slate-100">{row.nombreAmenity}</span> 
    },
    { 
      header: 'Unidad', 
      accessor: (row) => <span className="font-semibold text-brand-primary dark:text-blue-400">{row.nombreUnidad}</span> 
    },
    { 
      header: 'Posición', 
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-brand-surface-bright/20">
          #{row.posicion}
        </span>
      )
    },
    { 
      header: 'Estado', 
      accessor: (row) => {
        let colors = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        if (row.estado === 'ASIGNADA') colors = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        if (row.estado === 'EN_ESPERA') colors = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        if (row.estado === 'CANCELADA') colors = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';

        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors}`}>
            {row.estado}
          </span>
        );
      }
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-surface-bright/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Listas de Espera
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administración de la cola de espera para reservación de amenities.
          </p>
        </div>
        
        <CreateButton label="Añadir a Lista" onClick={handleOpenCreate} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por amenity o unidad..."
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
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
          {error}
        </div>
      )}

      <DataTable
        data={items}
        columns={columns}
        keyExtractor={(row) => row.idListaEspera.toString()}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={
          searchQuery
            ? 'No se encontraron registros para tu búsqueda.'
            : 'La lista de espera está vacía.'
        }
      />

      <ListaEsperaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedLista}
        amenities={amenities}
        unidades={unidades}
        isLoadingDependencies={isLoadingDependencies}
        isSubmitLoading={isSubmitLoading}
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmar eliminación"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ¿Estás seguro de que deseas remover este registro de la lista de espera?
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
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar Registro'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
