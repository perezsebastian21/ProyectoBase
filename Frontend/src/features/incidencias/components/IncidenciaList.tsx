'use client';

import React from 'react';
import { useIncidencias } from '../hooks/useIncidencias';
import IncidenciaFormModal from './IncidenciaFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import type { Incidencia } from '../types';

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

  const columns: Column<Incidencia>[] = [
    { 
      header: 'Reporte', 
      accessor: (row) => {
        const date = new Date(row.fechaReporte).toLocaleDateString();
        return (
          <div className="flex flex-col">
            <span className="font-bold text-[var(--foreground)]">{row.nombreAmenity}</span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        );
      }
    },
    { 
      header: 'Unidad', 
      accessor: (row) => <span className="font-medium text-blue-600 dark:text-blue-400">{row.nombreUnidad}</span> 
    },
    { 
      header: 'Descripción', 
      accessor: (row) => <span className="text-sm truncate max-w-[200px] block" title={row.descripcion}>{row.descripcion}</span>
    },
    { 
      header: 'Costo', 
      accessor: (row) => row.costoEstimado ? `$${row.costoEstimado}` : '-'
    },
    { 
      header: 'Estado', 
      accessor: (row) => {
        let colors = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        if (row.estado === 'RESUELTA') colors = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (row.estado === 'REPORTADA' || row.estado === 'EN_REVISION') colors = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        if (row.estado === 'EN_REPARACION') colors = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        if (row.estado === 'DESCARTADA') colors = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors}`}>
            {row.estado}
          </span>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Incidencias</h2>
          <p className="text-sm text-gray-500">
            Registro de problemas reportados en los amenities.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Reportar Incidencia
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--brand-surface)] p-4 rounded-xl border border-[var(--brand-surface-bright)]">
        <input
          type="text"
          placeholder="Buscar incidencia..."
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
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
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

      <IncidenciaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedIncidencia}
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Estás seguro que deseas eliminar esta incidencia del registro?
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitLoading}
              className="flex-1 px-4 py-2 rounded-xl border border-[var(--brand-surface-bright)] text-sm font-semibold hover:bg-[var(--brand-surface-container)]"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isSubmitLoading}
              className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
            >
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
