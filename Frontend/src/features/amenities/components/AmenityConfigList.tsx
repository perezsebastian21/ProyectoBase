'use client';

import React from 'react';
import { useAmenityConfigs } from '../hooks/useAmenityConfigs';
import AmenityConfigFormModal from './AmenityConfigFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import type { AmenityConfig } from '../types';

export default function AmenityConfigList() {
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
    isLoadingAmenities,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedConfig,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createConfig,
    updateConfig,
    deleteConfig,
  } = useAmenityConfigs();

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedConfig) {
      return updateConfig(payload);
    } else {
      return createConfig(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedConfig) {
      await deleteConfig(selectedConfig.idAmenityConfig);
    }
  };

  const columns: Column<AmenityConfig>[] = [
    { 
      header: 'Amenity', 
      accessor: (row) => <span className="font-bold text-[var(--foreground)]">{row.nombreAmenity}</span>
    },
    { 
      header: 'Horario', 
      accessor: (row) => `${row.horarioInicio.slice(0, 5)} a ${row.horarioFin.slice(0, 5)}`
    },
    { 
      header: 'Bloque / Limpieza', 
      accessor: (row) => `${row.duracionBloqueMinutos}m / ${row.tiempoLimpiezaMinutos}m`
    },
    { 
      header: 'Tarifa', 
      accessor: (row) => row.tarifa > 0 ? `$${row.tarifa}` : 'Gratis'
    },
    { 
      header: 'Aprobación', 
      accessor: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          row.requiereAprobacion ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {row.requiereAprobacion ? 'Sí' : 'No'}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Configuraciones de Amenities</h2>
          <p className="text-sm text-gray-500">
            Reglas de uso, horarios y tarifas de los amenities.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Nueva Configuración
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
        keyExtractor={(row) => row.idAmenityConfig.toString()}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={
          searchQuery
            ? 'No se encontraron configuraciones para tu búsqueda.'
            : 'No hay configuraciones registradas.'
        }
      />

      <AmenityConfigFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedConfig}
        amenities={amenities}
        isLoadingAmenities={isLoadingAmenities}
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
            ¿Estás seguro que deseas eliminar la configuración del amenity{' '}
            <strong className="text-[var(--foreground)]">"{selectedConfig?.nombreAmenity}"</strong>?
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
