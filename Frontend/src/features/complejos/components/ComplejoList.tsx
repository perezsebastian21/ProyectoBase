'use client';

import React from 'react';
import { useComplejos } from '../hooks/useComplejos';
import ComplejoFormModal from './ComplejoFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import type { Complejo } from '../types';

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

  const columns: Column<Complejo>[] = [
    { header: 'Nombre', accessor: 'nombre' },
    { 
      header: 'Consorcio', 
      accessor: (row) => <span className="font-medium text-blue-600 dark:text-blue-400">{row.nombreConsorcio}</span> 
    },
    { 
      header: 'Tipo', 
      accessor: (row) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-medium">
          {row.tipo}
        </span>
      )
    },
    { header: 'Dirección', accessor: 'direccion' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Complejos</h2>
          <p className="text-sm text-gray-500">
            Administración de los complejos del sistema.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Nuevo Complejo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--brand-surface)] p-4 rounded-xl border border-[var(--brand-surface-bright)]">
        <input
          type="text"
          placeholder="Buscar complejo..."
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

      <ComplejoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedComplejo}
        consorcios={consorcios}
        isLoadingConsorcios={isLoadingConsorcios}
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
            ¿Estás seguro que deseas eliminar el complejo{' '}
            <strong className="text-[var(--foreground)]">"{selectedComplejo?.nombre}"</strong>?
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
