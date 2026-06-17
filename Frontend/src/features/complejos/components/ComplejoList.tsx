'use client';

import React from 'react';
import { useComplejos } from '../hooks/useComplejos';
import ComplejoFormModal from './ComplejoFormModal';
import StatusBadge from '@/components/ui/StatusBadge';

export default function ComplejoList() {
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
    
    // Dropdown data
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

  const startRange = (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, totalCount);
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

  // Helper para pintar el Badge según el Tipo de Complejo
  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'EDIFICIO':
        return <StatusBadge status="success" label="Edificio" />;
      case 'BARRIO_CERRADO':
        return <StatusBadge status="warning" label="Barrio Cerrado" />;
      default:
        return <StatusBadge status="error" label={tipo || 'Otro'} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-brand-surface-container/60 dark:bg-slate-900/40 p-6 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 backdrop-blur-md">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Administración de Complejos
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            {totalCount === 1 ? '1 complejo registrado' : `${totalCount} complejos registrados`}
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-primary to-blue-600 hover:from-brand-primary/90 hover:to-blue-600/90 hover:shadow-[0_4px_25px_rgba(59,130,246,0.35)] active:scale-[0.98] transition-all rounded-xl shadow-lg cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Complejo
        </button>
      </div>

      {/* Search and Limit Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar complejos por nombre o dirección..."
            className="w-full pl-11 pr-4 py-3 bg-brand-surface dark:bg-slate-900/30 border border-brand-surface-bright/30 dark:border-white/5 rounded-2xl text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all backdrop-blur-sm shadow-sm dark:shadow-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Page Limit Selector */}
        <div className="flex items-center gap-2 bg-brand-surface dark:bg-slate-900/30 border border-brand-surface-bright/30 dark:border-white/5 px-4 py-2 rounded-2xl backdrop-blur-sm self-start md:self-auto shadow-sm dark:shadow-none">
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Mostrar:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-transparent border-none text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value={5} className="bg-brand-surface dark:bg-slate-900 text-slate-700 dark:text-slate-200">5 filas</option>
            <option value={10} className="bg-brand-surface dark:bg-slate-900 text-slate-700 dark:text-slate-200">10 filas</option>
            <option value={20} className="bg-brand-surface dark:bg-slate-900 text-slate-700 dark:text-slate-200">20 filas</option>
          </select>
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex gap-3 items-center">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-semibold">Error al cargar datos</h4>
            <p className="text-xs text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {/* Main Listing Grid */}
      {isLoading ? (
        /* Shimmer loading skeleton grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-brand-surface dark:bg-slate-900/30 border border-brand-surface-bright/20 dark:border-white/5 rounded-3xl p-6 space-y-4 shadow-sm dark:shadow-none">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-surface-container dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-brand-surface-container dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-brand-surface-container dark:bg-slate-800 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-brand-surface-bright/10 dark:border-white/5">
                <div className="h-3 bg-brand-surface-container dark:bg-slate-800 rounded w-4/5" />
                <div className="h-3 bg-brand-surface-container dark:bg-slate-800 rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="text-center p-12 rounded-3xl border border-dashed border-brand-surface-bright/30 dark:border-white/10 bg-brand-surface-container/30 dark:bg-slate-900/10">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No se encontraron complejos</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
            {searchQuery 
              ? 'Prueba modificando tu criterio de búsqueda o borrando los filtros activos.' 
              : 'Registra un complejo de viviendas o edificio para comenzar a administrar sus amenities.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl border border-brand-surface-bright/30 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        /* Complejo Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((complejo) => (
            <div 
              key={complejo.idComplejo} 
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-brand-surface-bright/20 dark:border-white/5 bg-brand-surface dark:bg-slate-900/20 p-6 shadow-sm hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] dark:shadow-none backdrop-blur-md hover:border-brand-primary/30 dark:hover:border-brand-primary/20 hover:bg-blue-50/40 dark:hover:bg-slate-900/35 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {/* Card Glow Element */}
              <div className="absolute -right-12 -top-12 -z-10 h-24 w-24 rounded-full bg-brand-primary/5 blur-2xl group-hover:bg-brand-primary/10 transition-colors" />

              <div className="space-y-4">
                {/* Header Information */}
                <div className="flex gap-4 items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary/20 to-blue-500/10 text-brand-primary border border-brand-primary/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight group-hover:text-slate-950 group-hover:dark:text-white transition-colors leading-tight">
                      {complejo.nombre}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getTipoBadge(complejo.tipo)}
                    </div>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="space-y-2 pt-4 border-t border-brand-surface-bright/10 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
                  {/* Direccion */}
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{complejo.direccion}</span>
                  </div>
                  
                  {/* Consorcio Asociado Name */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{complejo.nombreConsorcio}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-brand-surface-bright/10 dark:border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(complejo)}
                  className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all cursor-pointer"
                  title="Editar Complejo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleOpenDelete(complejo)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all cursor-pointer"
                  title="Eliminar Complejo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-surface-bright/10 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs">
          <div>
            Mostrando <span className="font-semibold text-slate-700 dark:text-slate-200">{startRange}</span> a{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{endRange}</span> de{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{totalCount}</span> complejos
          </div>
          
          <div className="flex items-center gap-1">
            {/* Back Button */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-brand-surface-bright/20 dark:border-white/5 bg-brand-surface dark:bg-slate-900/20 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page indicators */}
            <span className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-brand-surface dark:bg-slate-900/30 border border-brand-surface-bright/20 dark:border-white/5 rounded-xl">
              Pág. {page} de {totalPages}
            </span>

            {/* Next Button */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-brand-surface-bright/20 dark:border-white/5 bg-brand-surface dark:bg-slate-900/20 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Creation/Edition Form Modal */}
      <ComplejoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedComplejo}
        consorcios={consorcios}
        isLoadingConsorcios={isLoadingConsorcios}
        isSubmitLoading={isSubmitLoading}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedComplejo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsDeleteOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl animate-fade-in z-10 text-slate-800 dark:text-slate-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Confirmar eliminación</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                ¿Estás seguro que deseas eliminar el complejo{' '}
                <strong className="text-slate-800 dark:text-slate-200">"{selectedComplejo.nombre}"</strong>? Esta acción no puede revertirse.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-brand-surface-bright/30 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
