'use client';

import React from 'react';
import { useListasEspera } from '../hooks/useListasEspera';
import ListaEsperaFormModal from './ListaEsperaFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import type { ListaEspera } from '../types';

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
          <div className="flex flex-col">
            <span className="font-bold text-[var(--foreground)]">{date}</span>
            <span className="text-xs text-gray-500">{start}</span>
          </div>
        );
      }
    },
    { 
      header: 'Amenity', 
      accessor: (row) => <span className="font-medium">{row.nombreAmenity}</span> 
    },
    { 
      header: 'Unidad', 
      accessor: (row) => <span className="font-medium text-blue-600 dark:text-blue-400">{row.nombreUnidad}</span> 
    },
    { 
      header: 'Posición', 
      accessor: (row) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          #{row.posicion}
        </span>
      )
    },
    { 
      header: 'Estado', 
      accessor: (row) => {
        let colors = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        if (row.estado === 'ASIGNADA') colors = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (row.estado === 'EN_ESPERA') colors = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        if (row.estado === 'CANCELADA') colors = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

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
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Listas de Espera</h2>
          <p className="text-sm text-gray-500">
            Administración de cola de espera para reservas de amenities.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Añadir a Lista
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--brand-surface)] p-4 rounded-xl border border-[var(--brand-surface-bright)]">
        <input
          type="text"
          placeholder="Buscar..."
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Estás seguro que deseas remover este registro de la lista de espera?
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
