'use client';

import React from 'react';
import { useInvitados } from '../hooks/useInvitados';
import InvitadoFormModal from './InvitadoFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import type { Invitado } from '../types';

export default function InvitadoList() {
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
    selectedInvitado,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createInvitado,
    updateInvitado,
    deleteInvitado,
  } = useInvitados();

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedInvitado) {
      return updateInvitado(payload);
    } else {
      return createInvitado(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedInvitado) {
      await deleteInvitado(selectedInvitado.idInvitado);
    }
  };

  const columns: Column<Invitado>[] = [
    { 
      header: 'Nombre Completo', 
      accessor: (row) => <span className="font-bold text-[var(--foreground)]">{row.nombreCompleto}</span>
    },
    { 
      header: 'Unidad', 
      accessor: (row) => <span className="font-medium text-blue-600 dark:text-blue-400">{row.nombreUnidad}</span> 
    },
    { header: 'DNI', accessor: 'dni' },
    { header: 'Patente', accessor: (row) => row.patente || '-' },
    { 
      header: 'Expiración', 
      accessor: (row) => {
        if (!row.fechaExpiracion) return '-';
        const date = new Date(row.fechaExpiracion);
        const isExpired = date < new Date(new Date().setHours(0,0,0,0));
        return (
          <span className={isExpired ? 'text-red-500 font-medium' : 'text-green-600 dark:text-green-400'}>
            {date.toLocaleDateString()}
            {isExpired && ' (Expirado)'}
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
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Invitados</h2>
          <p className="text-sm text-gray-500">
            Registro de accesos temporales para invitados.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Nuevo Invitado
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--brand-surface)] p-4 rounded-xl border border-[var(--brand-surface-bright)]">
        <input
          type="text"
          placeholder="Buscar invitado..."
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
        keyExtractor={(row) => row.idInvitado.toString()}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={
          searchQuery
            ? 'No se encontraron invitados para tu búsqueda.'
            : 'No hay invitados registrados.'
        }
      />

      <InvitadoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedInvitado}
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
            ¿Estás seguro que deseas eliminar al invitado{' '}
            <strong className="text-[var(--foreground)]">"{selectedInvitado?.nombreCompleto}"</strong>?
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
