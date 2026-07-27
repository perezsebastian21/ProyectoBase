'use client';

import React, { useState } from 'react';
import { useReservas } from '../hooks/useReservas';
import ReservaFormModal from './ReservaFormModal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import type { Reserva } from '../types';
import { 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  List, 
  CalendarDays, 
  UserCheck, 
  Sparkles,
  Building,
  Check,
  X
} from 'lucide-react';

export default function ReservaList() {
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
    complejoActivo,
    isLoadingDependencies,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedReserva,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createReserva,
    updateReserva,
    deleteReserva,
  } = useReservas();

  // Estado de vista: 'table' o 'agenda'
  const [viewMode, setViewMode] = useState<'table' | 'agenda'>('agenda');

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFormSubmit = async (payload: any) => {
    if (selectedReserva) {
      return updateReserva(payload);
    } else {
      return createReserva(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedReserva) {
      await deleteReserva(selectedReserva.idReserva);
    }
  };

  const handleQuickStatusChange = async (reserva: Reserva, newStatus: string) => {
    await updateReserva({
      idReserva: reserva.idReserva,
      idAmenity: reserva.idAmenity,
      idUnidadHabitacional: reserva.idUnidadHabitacional,
      fechaUso: reserva.fechaUso,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin,
      cantidadInvitados: reserva.cantidadInvitados,
      estado: newStatus,
    });
  };

  // Métricas rápidas de reservas
  const aprobadasCount = items.filter((r) => r.estado === 'APROBADA').length;
  const pendientesCount = items.filter((r) => r.estado === 'PENDIENTE').length;
  const rechazadasCount = items.filter((r) => r.estado === 'RECHAZADA' || r.estado === 'CANCELADA').length;

  const columns: Column<Reserva>[] = [
    { 
      header: 'Fecha / Horario', 
      accessor: (row) => {
        const date = row.fechaUso ? new Date(row.fechaUso).toLocaleDateString() : '';
        const start = row.horaInicio ? row.horaInicio.slice(0, 5) : '';
        const end = row.horaFin ? row.horaFin.slice(0, 5) : '';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-brand-primary dark:text-blue-400 flex items-center justify-center font-extrabold text-xs border border-blue-500/20 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 dark:text-slate-100">{date}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{start} a {end} hs</span>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Amenity', 
      accessor: (row) => <span className="font-bold text-slate-800 dark:text-slate-100">{row.nombreAmenity}</span> 
    },
    { 
      header: 'Unidad', 
      accessor: (row) => <span className="font-semibold text-brand-primary dark:text-blue-400">{row.nombreUnidad}</span> 
    },
    { 
      header: 'Personas', 
      accessor: (row) => <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{row.cantidadInvitados || 1} pers.</span> 
    },
    { 
      header: 'Estado', 
      accessor: (row) => {
        let colors = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        if (row.estado === 'APROBADA') colors = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        if (row.estado === 'PENDIENTE') colors = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        if (row.estado === 'RECHAZADA' || row.estado === 'CANCELADA') colors = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';

        return (
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors}`}>
              {row.estado}
            </span>
            {row.estado === 'PENDIENTE' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleQuickStatusChange(row, 'APROBADA')}
                  className="p-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
                  title="Aprobar"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleQuickStatusChange(row, 'RECHAZADA')}
                  className="p-1 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"
                  title="Rechazar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      }
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-surface-bright/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Gestión de Reservas & Ocupación
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Supervisá y aprobá el uso de espacios comunes por parte de los residentes.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Switch de Vista: Tabla vs Agenda */}
          <div className="p-1 rounded-2xl bg-slate-200 dark:bg-slate-900 border border-slate-300/60 dark:border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Vista Agenda
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Vista Tabla
            </button>
          </div>

          <CreateButton label="Nueva Reserva" onClick={handleOpenCreate} />
        </div>
      </div>

      {/* KPI Cards de Reservas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Aprobadas</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{aprobadasCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-amber-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Pendientes</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{pendientesCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-red-500/20 backdrop-blur-md flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase text-red-600 dark:text-red-400">Rechazadas / Canceladas</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">{rechazadasCount}</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface dark:bg-slate-900/40 p-4 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por amenity o unidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface-container/40 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
          />
        </div>
        
        {viewMode === 'table' && (
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
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* RENDER SEGÚN VIEW MODE */}
      {viewMode === 'table' ? (
        <DataTable
          data={items}
          columns={columns}
          keyExtractor={(row) => row.idReserva.toString()}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage={
            searchQuery
              ? 'No se encontraron reservas para tu búsqueda.'
              : 'No hay reservas registradas.'
          }
        />
      ) : (
        /* VISTA AGENDA DE RESERVAS */
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-2 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-300">No hay reservas registradas en este período.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((reserva) => {
                const dateStr = reserva.fechaUso ? new Date(reserva.fechaUso).toLocaleDateString() : '';
                const start = reserva.horaInicio ? reserva.horaInicio.slice(0, 5) : '';
                const end = reserva.horaFin ? reserva.horaFin.slice(0, 5) : '';

                let statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                if (reserva.estado === 'APROBADA') statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                if (reserva.estado === 'RECHAZADA' || reserva.estado === 'CANCELADA') statusBadge = 'bg-red-500/10 text-red-400 border-red-500/20';

                return (
                  <div
                    key={reserva.idReserva}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition-all space-y-4 shadow-sm dark:shadow-lg backdrop-blur-md relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{reserva.nombreAmenity}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{reserva.nombreUnidad}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusBadge}`}>
                        {reserva.estado}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Fecha:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{dateStr}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Horario:</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{start} a {end} hs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Asistentes:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{reserva.cantidadInvitados || 1} personas</span>
                      </div>
                    </div>

                    {/* Acciones de 1-Click en la Agenda */}
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                      {reserva.estado === 'PENDIENTE' ? (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={() => handleQuickStatusChange(reserva, 'APROBADA')}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(reserva, 'RECHAZADA')}
                            className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Rechazar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 w-full">
                          <button
                            onClick={() => handleOpenEdit(reserva)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleOpenDelete(reserva)}
                            className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Formulario */}
      <ReservaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedReserva}
        amenities={amenities}
        unidades={unidades}
        isLoadingDependencies={isLoadingDependencies}
        isSubmitLoading={isSubmitLoading}
        complejoActivo={complejoActivo ?? null}
      />

      {/* Modal Eliminar */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmar eliminación"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ¿Estás seguro de que deseas cancelar y eliminar esta reserva?
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
              {isSubmitLoading ? 'Eliminando...' : 'Eliminar Reserva'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
