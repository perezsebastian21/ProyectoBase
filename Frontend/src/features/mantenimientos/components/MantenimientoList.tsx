'use client';

import React from 'react';
import { useMantenimientos } from '../hooks/useMantenimientos';
import MantenimientoFormModal from './MantenimientoFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import type { Mantenimiento } from '../types';

export default function MantenimientoList() {
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
    isLoadingDependencies,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedMantenimiento,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createMantenimiento,
    updateMantenimiento,
    deleteMantenimiento,
  } = useMantenimientos();

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedMantenimiento) {
      return updateMantenimiento(payload);
    } else {
      return createMantenimiento(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedMantenimiento) {
      await deleteMantenimiento(selectedMantenimiento.idMantenimiento);
    }
  };

  const columns: Column<Mantenimiento>[] = [
    { 
      header: 'Amenity', 
      accessor: (row) => <span className="font-bold text-[var(--foreground)]">{row.nombreAmenity}</span> 
    },
    { 
      header: 'Descripción', 
      accessor: (row) => <span className="text-sm truncate max-w-[200px] block" title={row.descripcion}>{row.descripcion}</span>
    },
    { 
      header: 'Recurrencia', 
      accessor: (row) => (
        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium">
          {row.recurrencia}
        </span>
      )
    },
    { 
      header: 'Fechas', 
      accessor: (row) => (
        <div className="flex flex-col text-xs text-gray-500">
          <span>{new Date(row.fechaInicio).toLocaleDateString()} al</span>
          <span>{new Date(row.fechaFin).toLocaleDateString()}</span>
        </div>
      )
    },
    { 
      header: 'Horario', 
      accessor: (row) => <span className="text-sm font-medium">{row.horaInicio.slice(0,5)} a {row.horaFin.slice(0,5)}</span>
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Mantenimientos Programados</h2>
          <p className="text-sm text-gray-500">
            Agenda de tareas de mantenimiento para los amenities.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Programar Mantenimiento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--brand-surface)] p-4 rounded-xl border border-[var(--brand-surface-bright)]">
        <input
          type="text"
          placeholder="Buscar mantenimiento..."
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
        keyExtractor={(row) => row.idMantenimiento.toString()}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={
          searchQuery
            ? 'No se encontraron mantenimientos para tu búsqueda.'
            : 'No hay mantenimientos programados.'
        }
      />

      <MantenimientoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedMantenimiento}
        amenities={amenities}
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
            ¿Estás seguro que deseas eliminar esta programación de mantenimiento?
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
