'use client';

import React, { useState } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import UsuarioFormModal from './UsuarioFormModal';
import { GestionRolesModal } from './GestionRolesModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import type { Usuario } from '../types';
import { Search, UserCheck, Shield } from 'lucide-react';

export default function UsuarioList() {
  const [rolesModalUsuario, setRolesModalUsuario] = useState<Usuario | null>(null);
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
    selectedUsuario,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createUsuario,
    updateUsuario,
    deleteUsuario,
  } = useUsuarios();

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedUsuario) {
      return updateUsuario(payload);
    } else {
      return createUsuario(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUsuario) {
      await deleteUsuario(selectedUsuario.idUsuario);
    }
  };

  const columns: Column<Usuario>[] = [
    { 
      header: 'Username', 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 text-brand-primary dark:text-blue-400 flex items-center justify-center font-extrabold text-xs border border-blue-500/20">
            <UserCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100">{row.username}</span>
        </div>
      )
    },
    { 
      header: 'Email', 
      accessor: (row) => <span className="text-slate-600 dark:text-slate-300">{row.email}</span>
    },
    { 
      header: 'Estado', 
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
          row.activo ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
          'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
        }`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Roles',
      accessor: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setRolesModalUsuario(row); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition active:scale-95 cursor-pointer"
          title="Gestionar roles"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Roles</span>
        </button>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-surface-bright/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Usuarios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administración de cuentas de usuario que acceden al sistema.
          </p>
        </div>
        
        <CreateButton label="Nuevo Usuario" onClick={handleOpenCreate} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por username o email..."
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
        keyExtractor={(row) => row.idUsuario.toString()}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={
          searchQuery
            ? 'No se encontraron usuarios para tu búsqueda.'
            : 'No hay usuarios registrados.'
        }
      />

      <UsuarioFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedUsuario}
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
            ¿Estás seguro de que deseas eliminar el usuario{' '}
            <strong className="text-slate-800 dark:text-slate-100 font-bold">"{selectedUsuario?.username}"</strong>?
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
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar Usuario'}
            </button>
          </div>
        </div>
      </Modal>

      {rolesModalUsuario && (
        <GestionRolesModal
          isOpen={!!rolesModalUsuario}
          onClose={() => setRolesModalUsuario(null)}
          idUsuario={rolesModalUsuario.idUsuario}
          username={rolesModalUsuario.username}
        />
      )}
    </div>
  );
}
