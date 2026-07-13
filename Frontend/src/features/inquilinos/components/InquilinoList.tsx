'use client';

import React from 'react';
import { useInquilinos } from '../hooks/useInquilinos';
import InquilinoFormModal from './InquilinoFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import type { Inquilino } from '../types';

export default function InquilinoList() {
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
    
    unidades,
    isLoadingUnidades,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedInquilino,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createInquilino,
    updateInquilino,
    deleteInquilino,
  } = useInquilinos();

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedInquilino) {
      return updateInquilino(payload);
    } else {
      return createInquilino(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedInquilino) {
      await deleteInquilino(selectedInquilino.idInquilino);
    }
  };

  const columns: Column<Inquilino>[] = [
    { 
      header: 'Nombre Completo', 
      accessor: (row) => <span className="font-bold text-[var(--foreground)]">{row.nombre} {row.apellido}</span>
    },
    { 
      header: 'Unidad', 
      accessor: (row) => <span className="font-medium text-blue-600 dark:text-blue-400">{row.nombreUnidad}</span> 
    },
    { header: 'DNI', accessor: 'dni' },
    { header: 'Celular', accessor: 'celular' },
    { 
      header: 'Estado', 
      accessor: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          row.activo ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Inquilinos</h2>
          <p className="text-sm text-gray-500">
            Administración de inquilinos de las unidades.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Nuevo Inquilino
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--brand-surface)] p-4 rounded-xl border border-[var(--brand-surface-bright)]">
        <input
          type="text"
          placeholder="Buscar inquilino..."
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
        keyExtractor={(row) => row.idInquilino.toString()}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={
          searchQuery
            ? 'No se encontraron inquilinos para tu búsqueda.'
            : 'No hay inquilinos registrados.'
        }
      />

      <InquilinoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedInquilino}
        unidades={unidades}
        isLoadingUnidades={isLoadingUnidades}
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
            ¿Estás seguro que deseas eliminar al inquilino{' '}
            <strong className="text-[var(--foreground)]">{selectedInquilino?.nombre} {selectedInquilino?.apellido}</strong>?
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
