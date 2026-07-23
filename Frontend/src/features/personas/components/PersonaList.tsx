'use client';

import React from 'react';
import { usePersonas } from '../hooks/usePersonas';
import PersonaFormModal from './PersonaFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import type { Persona } from '../types';
import { Search, User } from 'lucide-react';

export default function PersonaList() {
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
    
    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedPersona,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createPersona,
    updatePersona,
    deletePersona,
  } = usePersonas();

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedPersona) {
      return updatePersona(payload);
    } else {
      return createPersona(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedPersona) {
      await deletePersona(selectedPersona.idPersona);
    }
  };

  const columns: Column<Persona>[] = [
    { 
      header: 'Nombre Completo', 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-extrabold text-xs border border-purple-500/20">
            <User className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100">{row.nombre} {row.apellido}</span>
        </div>
      )
    },
    { 
      header: 'DNI', 
      accessor: (row) => (
        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
          {row.dni}
        </span>
      ) 
    },
    { header: 'Email', accessor: (row) => <span className="text-slate-600 dark:text-slate-300">{row.email}</span> },
    { header: 'Celular', accessor: (row) => <span className="text-slate-600 dark:text-slate-300">{row.celular}</span> },
    { 
      header: 'Edad', 
      accessor: (row) => {
        if (!row.fechaNacimiento) return '-';
        const birthDate = new Date(row.fechaNacimiento);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs); 
        return <span className="font-bold text-slate-700 dark:text-slate-200">{Math.abs(ageDate.getUTCFullYear() - 1970)} años</span>;
      }
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-surface-bright/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Personas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro global de personas del sistema.
          </p>
        </div>
        
        <CreateButton label="Nueva Persona" onClick={handleOpenCreate} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface-container/40 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
          />
        </div>
        
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
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
          {error}
        </div>
      )}

      <DataTable
        data={items}
        columns={columns}
        keyExtractor={(row) => row.idPersona.toString()}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={
          searchQuery
            ? 'No se encontraron personas para tu búsqueda.'
            : 'No hay personas registradas.'
        }
      />

      <PersonaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedPersona}
        isSubmitLoading={isSubmitLoading}
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmar eliminación"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong className="text-slate-800 dark:text-slate-100 font-bold">{selectedPersona?.nombre} {selectedPersona?.apellido}</strong>?
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
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar Persona'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
