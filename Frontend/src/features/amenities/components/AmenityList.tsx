'use client';

import React, { useState } from 'react';
import { useAmenities } from '../hooks/useAmenities';
import AmenityFormModal from './AmenityFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import type { Amenity } from '../types';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { 
  Search, 
  Sparkles, 
  LayoutGrid, 
  List, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Building,
  Edit2,
  Trash2,
  Sliders,
  Ban
} from 'lucide-react';
import { CancelacionMasivaModal } from './CancelacionMasivaModal';

export default function AmenityList() {
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
    
    complejos,
    isLoadingComplejos,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedAmenity,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createAmenity,
    updateAmenity,
    deleteAmenity,
  } = useAmenities();

  // Switch de vista: 'grid' o 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [cancelacionMasivaTarget, setCancelacionMasivaTarget] = useState<Amenity | null>(null);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedAmenity) {
      return updateAmenity(payload);
    } else {
      return createAmenity(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedAmenity) {
      await deleteAmenity(selectedAmenity.idAmenity);
    }
  };

  // Métricas rápidas de Amenities
  const activosCount = items.filter((a) => a.estado === 'ACTIVO').length;
  const mantenimientoCount = items.filter((a) => a.estado === 'MANTENIMIENTO').length;
  const capacidadTotal = items.reduce((acc, a) => acc + (a.capacidad || 0), 0);

  const columns: Column<Amenity>[] = [
    { 
      header: 'Nombre', 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center font-extrabold text-xs border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100">{row.nombre}</span>
        </div>
      )
    },
    { 
      header: 'Complejo', 
      accessor: (row) => <span className="font-semibold text-brand-primary dark:text-blue-400">{row.nombreComplejo}</span> 
    },
    { header: 'Capacidad', accessor: (row) => <span className="text-slate-600 dark:text-slate-300 font-semibold">{row.capacidad} personas</span> },
    { 
      header: 'Estado', 
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
          row.estado === 'ACTIVO' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
          row.estado === 'MANTENIMIENTO' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
          'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
        }`}>
          {row.estado}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-surface-bright/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Amenities del Edificio & Espacios Comunes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configuración y alta de espacios (SUM, Parrillas, Piscina, Gimnasio, Microcine).
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Switch de Vista: Grilla vs Tabla */}
          <div className="p-1 rounded-2xl bg-slate-200 dark:bg-slate-900 border border-slate-300/60 dark:border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grilla de Espacios
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

          <CreateButton label="Nuevo Amenity" onClick={handleOpenCreate} />
        </div>
      </div>

      {/* KPI Cards de Amenities */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-indigo-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400">Total Espacios</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{totalCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">En Operación</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{activosCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-amber-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">En Mantenimiento</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{mantenimientoCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-purple-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-purple-600 dark:text-purple-400">Capacidad Total</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{capacidadTotal} pers.</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar amenity por nombre..."
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
          keyExtractor={(row) => row.idAmenity.toString()}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage={
            searchQuery
              ? 'No se encontraron amenities para tu búsqueda.'
              : 'No hay amenities registrados.'
          }
        />
      ) : (
        /* VISTA GRILLA DE ESPACIOS DE AMENITIES */
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-2 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl">
              <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-300">No hay amenities registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((amenity) => {
                let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                if (amenity.estado === 'MANTENIMIENTO') statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                if (amenity.estado === 'INACTIVO') statusBadge = 'bg-red-500/10 text-red-400 border-red-500/20';

                return (
                  <div
                    key={amenity.idAmenity}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 transition-all space-y-4 shadow-sm dark:shadow-xl backdrop-blur-md relative group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-sm border border-indigo-500/20">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-800 dark:text-white">{amenity.nombre}</h4>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{amenity.nombreComplejo}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${statusBadge}`}>
                          {amenity.estado}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Aforo Máximo:</span>
                          <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> {amenity.capacidad} personas
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => router.push(ROUTES.AMENITY_CONFIG)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" /> Configurar Reglas
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(amenity)}
                            className="p-2 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(amenity)}
                            className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setCancelacionMasivaTarget(amenity)}
                        className="w-full py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Declarar fuera de servicio con cancelación masiva (CU-14)"
                      >
                        <Ban className="w-3.5 h-3.5" /> Declarar Fuera de Servicio (CU-14)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Formulario */}
      <AmenityFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedAmenity}
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
            ¿Estás seguro de que deseas eliminar este amenity?
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
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar Amenity'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Cancelación Masiva por Fuera de Servicio (CU-14) */}
      {cancelacionMasivaTarget && (
        <CancelacionMasivaModal
          isOpen={!!cancelacionMasivaTarget}
          onClose={() => setCancelacionMasivaTarget(null)}
          idAmenity={cancelacionMasivaTarget.idAmenity}
          nombreAmenity={cancelacionMasivaTarget.nombre}
        />
      )}
    </div>
  );
}
