'use client';

import React, { useState } from 'react';
import { useComplejos } from '../hooks/useComplejos';
import ComplejoFormModal from './ComplejoFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import type { Complejo } from '../types';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { 
  Plus, 
  Search, 
  Building, 
  Building2, 
  LayoutGrid, 
  List, 
  MapPin, 
  Sparkles, 
  Home as HomeIcon,
  Edit2,
  Trash2,
  ArrowRight
} from 'lucide-react';

export default function ComplejoList() {
  const router = useRouter();
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
    
    consorcios,
    isLoadingConsorcios,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedComplejo,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createComplejo,
    updateComplejo,
    deleteComplejo,
  } = useComplejos();

  // Switch de vista: 'bento' o 'table'
  const [viewMode, setViewMode] = useState<'bento' | 'table'>('bento');

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedComplejo) {
      return updateComplejo(payload);
    } else {
      return createComplejo(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedComplejo) {
      await deleteComplejo(selectedComplejo.idComplejo);
    }
  };

  // Métricas rápidas
  const torresCount = items.filter((c) => c.tipo?.toLowerCase().includes('torre') || c.tipo?.toLowerCase().includes('edificio')).length;

  const columns: Column<Complejo>[] = [
    {
      header: 'Complejo',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 flex items-center justify-center font-extrabold text-xs border border-cyan-500/20">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-100">{row.nombre}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Consorcio', 
      accessor: (row) => (
        <span className="font-semibold text-brand-primary dark:text-blue-400">
          {row.nombreConsorcio}
        </span>
      ) 
    },
    { 
      header: 'Tipo', 
      accessor: (row) => (
        <span className="px-2.5 py-1 bg-brand-surface-container/80 dark:bg-slate-800 rounded-lg text-xs font-semibold border border-brand-surface-bright/20 dark:border-white/10 text-slate-700 dark:text-slate-300">
          {row.tipo}
        </span>
      )
    },
    { header: 'Dirección', accessor: (row) => <span className="text-slate-600 dark:text-slate-300">{row.direccion}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-surface-bright/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Edificios & Complejos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administración de torres, condominios y barrios pertenecientes al consorcio.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Switch de Vista: Bento vs Tabla */}
          <div className="p-1 rounded-2xl bg-slate-200 dark:bg-slate-900 border border-slate-300/60 dark:border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('bento')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'bento'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Tarjetas Bento
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Vista Tabla
            </button>
          </div>

          <CreateButton label="Nuevo Complejo" onClick={handleOpenCreate} />
        </div>
      </div>

      {/* KPI Cards de Complejos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-cyan-600 dark:text-cyan-400">Total Complejos</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{totalCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-blue-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400">Consorcios Vinculados</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{consorcios.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-indigo-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <HomeIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400">Torres / Edificios</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{torresCount || totalCount}</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
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
          keyExtractor={(row) => row.idComplejo.toString()}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage={
            searchQuery
              ? 'No se encontraron complejos para tu búsqueda.'
              : 'No hay complejos registrados.'
          }
        />
      ) : (
        /* VISTA TARJETAS BENTO DE COMPLEJOS */
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-2 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl">
              <Building className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-300">No hay complejos registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((complejo) => (
                <div
                  key={complejo.idComplejo}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 hover:border-cyan-500/30 transition-all space-y-4 shadow-sm dark:shadow-xl backdrop-blur-md relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-extrabold text-sm border border-cyan-500/20">
                          <Building className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-800 dark:text-white">{complejo.nombre}</h4>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{complejo.nombreConsorcio}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                        {complejo.tipo}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span className="truncate">{complejo.direccion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Rápidas & Enlaces */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(ROUTES.AMENITIES_ADMIN)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Amenities
                      </button>
                      <button
                        onClick={() => router.push(ROUTES.UNIDADES)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <HomeIcon className="w-3.5 h-3.5" /> Unidades
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(complejo)}
                        className="p-2 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(complejo)}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Formulario */}
      <ComplejoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedComplejo}
        consorcios={consorcios}
        isLoadingConsorcios={isLoadingConsorcios}
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
            ¿Estás seguro de que deseas eliminar este complejo?
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
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar Complejo'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
