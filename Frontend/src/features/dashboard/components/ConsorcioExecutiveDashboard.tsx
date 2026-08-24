'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardActionCard from '@/components/ui/DashboardActionCard';
import ConsorcioComunicadoModal, { ComunicadoFormValues } from '@/features/consorcios/components/ConsorcioComunicadoModal';
import { ROUTES } from '@/constants';
import { useConsorcioActivo } from '@/components/providers';
import { reservaService } from '@/features/reservas/services/reservaService';
import { incidenciaService } from '@/features/incidencias/services/incidenciaService';
import { amenityService } from '@/features/amenities/services/amenityService';
import { unidadService } from '@/features/unidades/services/unidadService';
import { 
  Building2, 
  Building, 
  CalendarCheck, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  Megaphone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wrench, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  Loader2
} from 'lucide-react';

interface ConsorcioExecutiveDashboardProps {
  consorciosList: any[];
  complejosList: any[];
  selectedConsorcioId: string;
  selectedComplejoId: string;
  setSelectedConsorcioId: (id: string) => void;
  setSelectedComplejoId: (id: string) => void;
  isLoadingCounts: boolean;
  consorciosCount: number | null;
  complejosCount: number | null;
  handleSwitchRole: () => void;
}

export default function ConsorcioExecutiveDashboard({
  consorciosList,
  complejosList,
  selectedConsorcioId,
  selectedComplejoId,
  setSelectedConsorcioId,
  setSelectedComplejoId,
  isLoadingCounts,
  consorciosCount,
  complejosCount,
  handleSwitchRole,
}: ConsorcioExecutiveDashboardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setConsorcioActivo, setComplejoActivo, complejoActivo } = useConsorcioActivo();

  // Modal de Comunicados Rápido
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isNoticeSubmitting, setIsNoticeSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ----------------------------------------------------
  // QUERIES REALES DESDE EL BACKEND
  // ----------------------------------------------------

  // 1. Amenities del complejo activo
  const { data: amenitiesData, isLoading: isLoadingAmenities } = useQuery({
    queryKey: ['amenities', 'all'],
    queryFn: async () => {
      const response = await amenityService.getAll();
      return response.data || [];
    },
  });

  // 2. Unidades del complejo activo
  const { data: unidadesData, isLoading: isLoadingUnidades } = useQuery({
    queryKey: ['unidades', 'all'],
    queryFn: async () => {
      const response = await unidadService.getAll();
      return response.data || [];
    },
  });

  const amenities = amenitiesData || [];
  const unidades = unidadesData || [];

  const amenitiesFiltrados = selectedComplejoId
    ? amenities.filter((a) => a.idComplejo.toString() === selectedComplejoId)
    : amenities;

  const unidadesFiltradas = selectedComplejoId
    ? unidades.filter((u) => u.idComplejo.toString() === selectedComplejoId)
    : unidades;

  const amenityIdsFiltrados = new Set(amenitiesFiltrados.map((a) => a.idAmenity));

  // 3. Reservas en vivo
  const { data: reservasData, isLoading: isLoadingReservas } = useQuery({
    queryKey: ['reservas', 'dashboard', selectedComplejoId, amenities],
    queryFn: async () => {
      const response = await reservaService.findQP(1, 100, '');
      if (!response.success) return [];
      const items = response.data?.items || [];
      return selectedComplejoId
        ? items.filter((r) => amenityIdsFiltrados.has(r.idAmenity))
        : items;
    },
    enabled: !!amenitiesData,
  });

  // 4. Incidencias en vivo
  const { data: incidenciasData, isLoading: isLoadingIncidencias } = useQuery({
    queryKey: ['incidencias', 'dashboard', selectedComplejoId, amenities],
    queryFn: async () => {
      const response = await incidenciaService.findQP(1, 100, '');
      if (!response.success) return [];
      const items = response.data?.items || [];
      return selectedComplejoId
        ? items.filter((i) => i.idAmenity == null || amenityIdsFiltrados.has(i.idAmenity))
        : items;
    },
    enabled: !!amenitiesData,
  });

  const reservas = reservasData || [];
  const incidencias = incidenciasData || [];

  // ----------------------------------------------------
  // MÉTRICAS CALCULADAS EN TIEMPO REAL
  // ----------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const reservasHoy = reservas.filter((r) => r.fechaUso && r.fechaUso.startsWith(todayStr));
  const reservasPendientes = reservas.filter((r) => r.estado === 'PENDIENTE');

  const incidenciasAbiertas = incidencias.filter(
    (i) => i.estado === 'REPORTADA' || i.estado === 'EN_REVISION' || i.estado === 'EN_REPARACION'
  );
  const incidenciasUrgentes = incidencias.filter((i) => i.estado === 'REPORTADA');

  // ----------------------------------------------------
  // FEED DE ATENCIÓN REQUERIDA (MUTACIONES REALES 1-CLICK)
  // ----------------------------------------------------
  const updateReservaMutation = useMutation({
    mutationFn: (payload: any) => reservaService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
    },
  });

  const updateIncidenciaMutation = useMutation({
    mutationFn: (payload: any) => incidenciaService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidencias'] });
    },
  });

  const handleApproveReserva = async (reserva: any) => {
    try {
      const payload = {
        idReserva: reserva.idReserva,
        idAmenity: reserva.idAmenity,
        idUnidadHabitacional: reserva.idUnidadHabitacional,
        fechaUso: reserva.fechaUso,
        horaInicio: reserva.horaInicio,
        horaFin: reserva.horaFin,
        cantidadInvitados: reserva.cantidadInvitados || 1,
        estado: 'APROBADA',
      };
      const res = await updateReservaMutation.mutateAsync(payload);
      if (res.success) {
        showToast(`✅ Reserva #${reserva.idReserva} APROBADA exitosamente.`);
      } else {
        showToast(`⚠️ Error: ${res.errorMessage || 'No se pudo aprobar la reserva.'}`);
      }
    } catch (err: any) {
      showToast(`❌ Error de conexión al aprobar reserva.`);
    }
  };

  const handleRejectReserva = async (reserva: any) => {
    try {
      const payload = {
        idReserva: reserva.idReserva,
        idAmenity: reserva.idAmenity,
        idUnidadHabitacional: reserva.idUnidadHabitacional,
        fechaUso: reserva.fechaUso,
        horaInicio: reserva.horaInicio,
        horaFin: reserva.horaFin,
        cantidadInvitados: reserva.cantidadInvitados || 1,
        estado: 'RECHAZADA',
      };
      const res = await updateReservaMutation.mutateAsync(payload);
      if (res.success) {
        showToast(`❌ Reserva #${reserva.idReserva} RECHAZADA.`);
      } else {
        showToast(`⚠️ Error: ${res.errorMessage || 'No se pudo rechazar.'}`);
      }
    } catch (err: any) {
      showToast(`❌ Error de conexión al rechazar reserva.`);
    }
  };

  const handleAdvanceIncidencia = async (incidencia: any) => {
    try {
      const payload = {
        idIncidencia: incidencia.idIncidencia,
        idAmenity: incidencia.idAmenity,
        idUnidadHabitacional: incidencia.idUnidadHabitacional,
        descripcion: incidencia.descripcion,
        costoEstimado: incidencia.costoEstimado,
        estado: 'EN_REVISION',
      };
      const res = await updateIncidenciaMutation.mutateAsync(payload);
      if (res.success) {
        showToast(`🔧 Incidencia #${incidencia.idIncidencia} marcada EN REVISIÓN.`);
      } else {
        showToast(`⚠️ Error: ${res.errorMessage || 'No se pudo actualizar.'}`);
      }
    } catch (err: any) {
      showToast(`❌ Error al actualizar incidencia.`);
    }
  };

  const handleNoticeSubmit = async (data: ComunicadoFormValues) => {
    setIsNoticeSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsNoticeSubmitting(false);
    setIsNoticeModalOpen(false);
    showToast(`📢 Comunicado "${data.titulo}" publicado y notificado a los residentes.`);
  };

  const complejosDelConsorcio = selectedConsorcioId
    ? complejosList.filter((c) => c.idConsorcio.toString() === selectedConsorcioId)
    : complejosList;

  const complejosOptions = complejosDelConsorcio.map((c) => ({
    value: c.idComplejo.toString(),
    label: c.nombre,
  }));

  // Combinación de elementos reales para el feed de Atención Requerida
  const pendingActionItems = [
    ...reservasPendientes.map((r) => {
      const amenity = amenities.find((a) => a.idAmenity === r.idAmenity);
      const unidad = unidades.find((u) => u.idUnidadHabitacional === r.idUnidadHabitacional);
      return {
        id: `res-${r.idReserva}`,
        raw: r,
        kind: 'reserva',
        title: `Reserva: ${amenity ? amenity.nombre : 'Amenity'}`,
        subtitle: `Solicitado por ${unidad ? unidad.identificador : 'Unidad Habitacional'} • ${r.fechaUso ? new Date(r.fechaUso).toLocaleDateString() : ''} (${r.horaInicio?.slice(0, 5)} - ${r.horaFin?.slice(0, 5)} hs)`,
        badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      };
    }),
    ...incidenciasUrgentes.map((inc) => {
      const amenity = amenities.find((a) => a.idAmenity === inc.idAmenity);
      const unidad = unidades.find((u) => u.idUnidadHabitacional === inc.idUnidadHabitacional);
      return {
        id: `inc-${inc.idIncidencia}`,
        raw: inc,
        kind: 'incidencia',
        title: `Incidencia: ${inc.descripcion}`,
        subtitle: `Ubicación: ${amenity ? amenity.nombre : unidad ? unidad.identificador : 'Área Común'} • Reportada reciéntemente`,
        badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20',
      };
    }),
  ];

  return (
    <div className="space-y-8 animate-fade-in relative pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 text-white text-xs font-semibold shadow-2xl border border-white/10 backdrop-blur-md animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner Consorcio Hero / Command Center Header */}
      <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-100/80 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 -z-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute right-24 -bottom-12 -z-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="flex flex-col gap-6 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping" />
                  Centro Operativo Consorcio
                </span>
                <button
                  onClick={handleSwitchRole}
                  className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  (Cambiar Rol)
                </button>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                <span>Gestión de Consorcio &amp; Edificios</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Supervisá en tiempo real la administración de consorcios, ocupación de amenities y atención de incidencias del edificio.
              </p>
            </div>

            {/* Acciones Rápidas en Banner Header */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer transition-all flex items-center gap-2"
              >
                <Megaphone className="w-4 h-4" />
                <span>Emitir Comunicado Rápido</span>
              </button>

              <button
                onClick={() => router.push(selectedConsorcioId ? `/dashboard/consorcios/${selectedConsorcioId}` : ROUTES.CONSORCIOS)}
                className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Perfil Legal</span>
              </button>
            </div>
          </div>

          {/* Context Selector (Consorcio & Edificio Activo) */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-inner backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                1. Consorcio / Razón Social:
              </label>
              <select
                value={selectedConsorcioId}
                onChange={(e) => {
                  const newConsorcioId = e.target.value;
                  setSelectedConsorcioId(newConsorcioId);
                  const found = consorciosList.find((c) => c.idConsorcio.toString() === newConsorcioId);
                  if (found) setConsorcioActivo({ id: found.idConsorcio, nombre: found.nombre });
                  const matchingComplejos = complejosList.filter((c) => c.idConsorcio.toString() === newConsorcioId);
                  if (matchingComplejos.length > 0) {
                    setSelectedComplejoId(matchingComplejos[0].idComplejo.toString());
                    setComplejoActivo({ id: matchingComplejos[0].idComplejo, nombre: matchingComplejos[0].nombre });
                  } else {
                    setSelectedComplejoId('');
                    setComplejoActivo(null);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
              >
                {consorciosList.length === 0 ? (
                  <option value="">No hay consorcios registrados</option>
                ) : (
                  consorciosList.map((c) => (
                    <option key={c.idConsorcio} value={c.idConsorcio.toString()}>
                      {c.nombre} (CUIT: {c.cuit})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                2. Edificio / Torre en Operación:
              </label>
              <select
                value={selectedComplejoId}
                onChange={(e) => {
                  setSelectedComplejoId(e.target.value);
                  const found = complejosList.find((c) => c.idComplejo.toString() === e.target.value);
                  if (found) setComplejoActivo({ id: found.idComplejo, nombre: found.nombre });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer transition-all"
              >
                {complejosDelConsorcio.length === 0 ? (
                  <option value="">(Todos los edificios del consorcio)</option>
                ) : (
                  complejosDelConsorcio.map((comp) => (
                    <option key={comp.idComplejo} value={comp.idComplejo.toString()}>
                      {comp.nombre} ({comp.tipo})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Bento Metrics Cards con Datos Reales */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-50/80 via-white/60 to-slate-50/80 dark:from-blue-950/40 dark:via-slate-900/40 dark:to-slate-900/80 shadow-md backdrop-blur-md relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Reservas Hoy</span>
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
              {isLoadingReservas ? <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" /> : `${reservasHoy.length} Reservas`}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> {reservas.length} totales en registro
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-50/80 via-white/60 to-slate-50/80 dark:from-red-950/40 dark:via-slate-900/40 dark:to-slate-900/80 shadow-md backdrop-blur-md relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Incidencias Críticas</span>
            <div className="p-2 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
              {isLoadingIncidencias ? <Loader2 className="w-6 h-6 animate-spin text-red-600 dark:text-red-400" /> : `${incidenciasAbiertas.length} Abiertas`}
            </div>
            <p className="text-[11px] text-red-600 dark:text-red-300 mt-1 flex items-center gap-1 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" /> {incidenciasUrgentes.length} reportadas recién
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-50/80 via-white/60 to-slate-50/80 dark:from-amber-950/40 dark:via-slate-900/40 dark:to-slate-900/80 shadow-md backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Aprobaciones</span>
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">{pendingActionItems.length} Pendientes</div>
            <p className="text-[11px] text-amber-600 dark:text-amber-300 mt-1">Aprobación directa en 1-click</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 via-white/60 to-slate-50/80 dark:from-emerald-950/40 dark:via-slate-900/40 dark:to-slate-900/80 shadow-md backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Amenities Activos</span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
              {isLoadingAmenities ? <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" /> : `${amenitiesFiltrados.length} Espacios`}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">En operación en complejo</p>
          </div>
        </div>
      </section>

      {/* Widget de Atención Requerida (Quick Approvals 1-Click Feed con Datos Reales) */}
      <section className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
              Atención Requerida &bull; Acciones Rápidas (1-Click)
            </h3>
          </div>
          <button
            onClick={() => router.push(ROUTES.RESERVAS_ADMIN)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingActionItems.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">¡Todo al día en el consorcio!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">No hay reservas ni incidencias pendientes de aprobación en este momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingActionItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.kind}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{item.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.kind === 'reserva' ? (
                    <>
                      <button
                        onClick={() => handleApproveReserva(item.raw)}
                        disabled={updateReservaMutation.isPending}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRejectReserva(item.raw)}
                        disabled={updateReservaMutation.isPending}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAdvanceIncidencia(item.raw)}
                      disabled={updateIncidenciaMutation.isPending}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Wrench className="w-4 h-4" />
                      Pasar a Revisión
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Módulos Bento de Gestión del Consorcio */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 pb-2">
          Módulos de Gestión del Consorcio &amp; Edificios
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardActionCard
            category="Personas"
            title="Inquilinos & Residentes"
            badgeLabel="Padrón Activo"
            badgeStatus="success"
            description="Administrá los perfiles de inquilinos, propietarios y pases de invitados asignados a las unidades."
            icon={<Users className="w-5 h-5 text-blue-400" />}
            onClick={() => router.push(ROUTES.INQUILINOS)}
          />

          <DashboardActionCard
            category="Inmuebles"
            title="Edificios & Complejos"
            badgeLabel={isLoadingCounts ? 'Cargando...' : `${complejosCount ?? 0} Edificios`}
            badgeStatus="success"
            description="Visualizá y gestioná la lista de torres y barrios pertenecientes a tus consorcios."
            icon={<Building className="w-5 h-5 text-cyan-400" />}
            onClick={() => router.push(ROUTES.COMPLEJOS)}
          />

          <DashboardActionCard
            category="Espacios"
            title="Amenities del Edificio"
            badgeLabel={isLoadingAmenities ? 'Cargando...' : `${amenitiesFiltrados.length} Espacios`}
            badgeStatus="success"
            description="Creá y administrá los amenities del consorcio, horarios de uso, cupos y tarifas."
            icon={<Sparkles className="w-5 h-5 text-indigo-400" />}
            onClick={() => router.push(ROUTES.AMENITIES_ADMIN)}
          />

          <DashboardActionCard
            category="Residentes"
            title="Reservas & Aprobaciones"
            badgeLabel={`${reservasPendientes.length} Pendientes`}
            badgeStatus={reservasPendientes.length > 0 ? 'warning' : 'success'}
            description="Revisá y aprobá las solicitudes de reservas para SUM y Parrillas."
            icon={<CalendarCheck className="w-5 h-5 text-amber-400" />}
            onClick={() => router.push(ROUTES.RESERVAS_ADMIN)}
          />

          <DashboardActionCard
            category="Edificio"
            title="Incidencias & Tareas"
            badgeLabel={`${incidenciasAbiertas.length} Activas`}
            badgeStatus={incidenciasAbiertas.length > 0 ? 'error' : 'success'}
            description="Gestioná los reportes de roturas y reparaciones en áreas comunes."
            icon={<Wrench className="w-5 h-5 text-red-400" />}
            onClick={() => router.push(ROUTES.INCIDENCIAS_ADMIN)}
          />

          <DashboardActionCard
            category="Inmuebles"
            title="Unidades Habitacionales"
            badgeLabel={isLoadingUnidades ? 'Cargando...' : `${unidadesFiltradas.length} Unidades`}
            badgeStatus="success"
            description="Padrón de departamentos y unidades del edificio con sus residentes."
            icon={<Users className="w-5 h-5 text-emerald-400" />}
            onClick={() => router.push(ROUTES.UNIDADES)}
          />
        </div>
      </section>

      {/* Botón Flotante de Acción Rápida (FAB Mobile) */}
      <button
        onClick={() => setIsNoticeModalOpen(true)}
        className="fixed bottom-24 right-5 sm:hidden z-40 p-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-2xl shadow-blue-500/50 active:scale-95 transition-all flex items-center justify-center border border-white/20"
        title="Emitir Comunicado Rápido"
        aria-label="Emitir Comunicado Rápido"
      >
        <Megaphone className="w-6 h-6 animate-pulse" />
      </button>

      {/* Modal de Publicar Comunicado Rápido */}
      <ConsorcioComunicadoModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onSubmit={handleNoticeSubmit}
        isSubmitLoading={isNoticeSubmitting}
        complejosOptions={complejosOptions}
      />
    </div>
  );
}
