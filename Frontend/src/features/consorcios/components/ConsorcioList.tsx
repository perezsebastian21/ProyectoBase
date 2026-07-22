'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConsorcios } from '../hooks/useConsorcios';
import ConsorcioFormModal from './ConsorcioFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui';
import StatusBadge from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import type { Consorcio } from '../types';
import { Search, Building2, MapPin, Mail, Phone } from 'lucide-react';
import { roleService } from '@/lib/role-service';
import { useConsorcioActivo } from '@/components/providers';

export default function ConsorcioList() {
  const router = useRouter();
  const { consorcioActivo } = useConsorcioActivo();

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
    selectedConsorcio,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createConsorcio,
    updateConsorcio,
    deleteConsorcio,
  } = useConsorcios();

  // Si el rol activo es Consorcio, redirigir automáticamente al perfil de su Consorcio Activo
  useEffect(() => {
    const role = roleService.getActiveRole();
    if (role === 'Consorcio') {
      const targetId = consorcioActivo?.id || (items.length > 0 ? items[0].idConsorcio : 1);
      router.replace(`/dashboard/consorcios/${targetId}`);
    }
  }, [consorcioActivo, items, router]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedConsorcio) {
      return updateConsorcio(payload);
    } else {
      return createConsorcio(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedConsorcio) {
      await deleteConsorcio(selectedConsorcio.idConsorcio);
    }
  };

  const columns: Column<Consorcio>[] = [
    {
      header: 'Consorcio',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-emerald-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-xs border border-blue-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-100">{row.nombre}</div>
            {row.direccionLegal && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                <span>{row.direccionLegal}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    { 
      header: 'CUIT', 
      accessor: (row) => (
        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700/50">
          {row.cuit}
        </span>
      ) 
    },
    {
      header: 'Contacto',
      accessor: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{row.telefono}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (row) => {
        const estado = row.estado || 'active';
        const badgeMap = {
          active: { status: 'success' as const, label: 'Activo' },
          pending: { status: 'warning' as const, label: 'Pendiente' },
          inactive: { status: 'error' as const, label: 'Inactivo' },
          suspended: { status: 'error' as const, label: 'Suspendido' },
        };
        const badge = badgeMap[estado] || badgeMap.active;
        return <StatusBadge status={badge.status} label={badge.label} />;
      }
    }
  ];


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-surface-bright/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Consorcios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administración de consorcios y datos de contacto oficiales.
          </p>
        </div>
        
        <CreateButton label="Nuevo Consorcio" onClick={handleOpenCreate} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        {/* Search input with icon */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o CUIT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface-container/40 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
          />
        </div>
        
        {/* Rows limit selector */}
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

      {/* Styled DataTable */}
      <DataTable
        data={items}
        columns={columns}
        keyExtractor={(row) => row.idConsorcio.toString()}
        onRowClick={(row) => router.push(`/dashboard/consorcios/${row.idConsorcio}`)}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={
          searchQuery
            ? 'No se encontraron consorcios para tu búsqueda.'
            : 'No hay consorcios registrados.'
        }
      />


      <ConsorcioFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedConsorcio}
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
            ¿Estás seguro de que deseas eliminar el consorcio{' '}
            <strong className="text-slate-800 dark:text-slate-100 font-bold">"{selectedConsorcio?.nombre}"</strong>? Esta acción no se puede deshacer.
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
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar Consorcio'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
