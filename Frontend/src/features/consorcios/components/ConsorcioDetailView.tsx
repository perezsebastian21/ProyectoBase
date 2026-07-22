'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { consorcioService } from '../services/consorcioService';
import { complejoService } from '@/features/complejos/services/complejoService';
import ConsorcioFormModal from './ConsorcioFormModal';
import ConsorcioPersonalModal, { PersonalFormValues } from './ConsorcioPersonalModal';
import ConsorcioComunicadoModal, { ComunicadoFormValues } from './ConsorcioComunicadoModal';
import ComplejoFormModal from '@/features/complejos/components/ComplejoFormModal';
import StatusBadge from '@/components/ui/StatusBadge';
import { ROUTES } from '@/constants';
import type { Consorcio } from '../types';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Edit,
  Plus,
  Users,
  Shield,
  Wrench,
  Layers,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Megaphone,
  BarChart3,
  Download,
  TrendingUp,
  Clock,
  BellRing
} from 'lucide-react';

interface PersonalMember {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'security' | 'maintenance';
  cargo: string;
  complejoNombre?: string;
  estado: 'active' | 'invited';
}

interface ComunicadoItem {
  id: string;
  titulo: string;
  contenido: string;
  tipo: 'asamblea' | 'mantenimiento' | 'comunicado_general' | 'emergencia';
  prioridad: 'normal' | 'urgente';
  fecha: string;
  complejoNombre?: string;
}

interface ConsorcioDetailViewProps {
  consorcioId: number;
}

export default function ConsorcioDetailView({ consorcioId }: ConsorcioDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'complejos' | 'personal' | 'metricas' | 'comunicados' | 'reglas'>('general');

  // Modales
  const [isEditConsorcioOpen, setIsEditConsorcioOpen] = useState(false);
  const [isAddComplejoOpen, setIsAddComplejoOpen] = useState(false);
  const [isInvitePersonalOpen, setIsInvitePersonalOpen] = useState(false);
  const [isComunicadoOpen, setIsComunicadoOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [reportExportedMessage, setReportExportedMessage] = useState<string | null>(null);

  // Lista local simulada de personal para CU-CONS-04
  const [personalList, setPersonalList] = useState<PersonalMember[]>([
    {
      id: 'p-1',
      nombre: 'Carlos Rodríguez',
      email: 'crodriguez@edificio.com',
      rol: 'admin',
      cargo: 'Administrador de Torre',
      estado: 'active',
    },
    {
      id: 'p-2',
      nombre: 'Guardia Principal',
      email: 'seguridad@edificio.com',
      rol: 'security',
      cargo: 'Personal de Vigilancia 24hs',
      estado: 'active',
    },
    {
      id: 'p-3',
      nombre: 'Mantenimiento General',
      email: 'mantenimiento@edificio.com',
      rol: 'maintenance',
      cargo: 'Servicios Técnicos Integral',
      estado: 'active',
    },
  ]);

  // Lista local simulada de comunicados para CU-CONS-07
  const [comunicadosList, setComunicadosList] = useState<ComunicadoItem[]>([
    {
      id: 'c-1',
      titulo: 'Convocatoria a Asamblea Ordinaria 2026',
      contenido: 'Estimados propietarios e inquilinos, los convocamos a la asamblea anual a realizarse en el SUM principal.',
      tipo: 'asamblea',
      prioridad: 'urgente',
      fecha: '2026-07-20 18:00',
      complejoNombre: 'Todos los Complejos',
    },
    {
      id: 'c-2',
      titulo: 'Mantenimiento Programado de Piscinas',
      contenido: 'Se informa que el sector de piscinas permanecerá cerrado por limpieza profunda el día Lunes.',
      tipo: 'mantenimiento',
      prioridad: 'normal',
      fecha: '2026-07-18 10:30',
      complejoNombre: 'Torre Mirador Sur',
    },
  ]);

  // Query Consorcio por ID
  const { data: consorcioData, isLoading: isLoadingConsorcio, refetch: refetchConsorcio } = useQuery({
    queryKey: ['consorcio', consorcioId],
    queryFn: async () => {
      const res = await consorcioService.getById(consorcioId);
      if (res.success && res.data) return res.data;
      throw new Error(res.errorMessage || 'No se encontró el consorcio');
    },
  });

  // Query Complejos del Consorcio (CU-CONS-03)
  const { data: complejosData, isLoading: isLoadingComplejos, refetch: refetchComplejos } = useQuery({
    queryKey: ['complejos-consorcio', consorcioId],
    queryFn: async () => {
      const res = await complejoService.findQP(1, 100, '');
      if (res.success && res.data) {
        return res.data.items.filter(c => c.idConsorcio === consorcioId);
      }
      return [];
    },
  });

  const consorcio = consorcioData;
  const complejos = complejosData || [];

  const handleUpdateConsorcio = async (payload: any) => {
    setIsActionLoading(true);
    try {
      const res = await consorcioService.update(payload);
      if (res.success) {
        await refetchConsorcio();
        setIsEditConsorcioOpen(false);
        return { success: true };
      }
      return { success: false, error: res.errorMessage || 'Error al actualizar consorcio' };
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateComplejo = async (payload: any) => {
    setIsActionLoading(true);
    try {
      const res = await complejoService.create(payload);
      if (res.success) {
        await refetchComplejos();
        setIsAddComplejoOpen(false);
        return { success: true };
      }
      return { success: false, error: res.errorMessage || 'Error al crear complejo' };
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleInvitePersonal = async (data: PersonalFormValues) => {
    setIsActionLoading(true);
    try {
      const complejoAsignado = complejos.find(c => c.idComplejo.toString() === data.idComplejo);
      const newMember: PersonalMember = {
        id: `p-${Date.now()}`,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        cargo: data.cargo,
        complejoNombre: complejoAsignado ? complejoAsignado.nombre : 'Todo el Consorcio',
        estado: 'invited',
      };
      setPersonalList(prev => [newMember, ...prev]);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateComunicado = async (data: ComunicadoFormValues) => {
    setIsActionLoading(true);
    try {
      const complejoAsignado = complejos.find(c => c.idComplejo.toString() === data.idComplejo);
      const newComunicado: ComunicadoItem = {
        id: `c-${Date.now()}`,
        titulo: data.titulo,
        contenido: data.contenido,
        tipo: data.tipo,
        prioridad: data.prioridad,
        fecha: new Date().toLocaleString(),
        complejoNombre: complejoAsignado ? complejoAsignado.nombre : 'Todos los Complejos',
      };
      setComunicadosList(prev => [newComunicado, ...prev]);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExportReport = () => {
    setReportExportedMessage('¡Reporte generado! Se ha iniciado la descarga del informe de gestión en PDF.');
    setTimeout(() => setReportExportedMessage(null), 4500);
  };

  if (isLoadingConsorcio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 animate-pulse">Cargando perfil del consorcio...</p>
      </div>
    );
  }

  if (!consorcio) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Consorcio no encontrado</h3>
        <button
          onClick={() => router.push(ROUTES.CONSORCIOS)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          Volver a Consorcios
        </button>
      </div>
    );
  }

  const badgeMap = {
    active: { status: 'success' as const, label: 'Activo' },
    pending: { status: 'warning' as const, label: 'Pendiente' },
    inactive: { status: 'error' as const, label: 'Inactivo' },
    suspended: { status: 'error' as const, label: 'Suspendido (SaaS)' },
  };

  const currentBadge = badgeMap[consorcio.estado || 'active'] || badgeMap.active;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.push(ROUTES.CONSORCIOS)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de Consorcios</span>
        </button>

        {/* Profile Card Header */}
        <div className="bg-brand-surface dark:bg-slate-900/60 p-6 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-xl shadow-blue-500/5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {consorcio.nombre}
                </h1>
                <StatusBadge status={currentBadge.status} label={currentBadge.label} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 font-bold">
                  CUIT: {consorcio.cuit}
                </span>
                {consorcio.direccionLegal && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {consorcio.direccionLegal}
                  </span>
                )}
                {consorcio.planSaas && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Plan {consorcio.planSaas}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setIsEditConsorcioOpen(true)}
              className="px-4 py-2.5 rounded-2xl border border-brand-surface-bright/20 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-brand-surface-container flex items-center gap-2 cursor-pointer transition-all"
            >
              <Edit className="w-4 h-4 text-blue-500" />
              <span>Editar Perfil</span>
            </button>
            <button
              onClick={() => setIsComunicadoOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer transition-all"
            >
              <Megaphone className="w-4 h-4" />
              <span>Emitir Comunicado</span>
            </button>
          </div>
        </div>
      </div>

      {reportExportedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{reportExportedMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-brand-surface-bright/20 dark:border-white/10 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Información General</span>
        </button>

        <button
          onClick={() => setActiveTab('complejos')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'complejos'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Complejos y Edificios ({complejos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'personal'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personal y Accesos ({personalList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('metricas')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'metricas'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Métricas & Reportes</span>
        </button>

        <button
          onClick={() => setActiveTab('comunicados')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'comunicados'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Comunicados ({comunicadosList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reglas')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'reglas'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Reglas Marco</span>
        </button>
      </div>

      {/* Tab: General */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-brand-surface dark:bg-slate-900/40 p-6 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                Datos de Contacto Institucional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-brand-surface-bright/10 dark:border-white/5 space-y-1">
                  <span className="text-slate-400 font-medium">Correo Electrónico Oficial</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{consorcio.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-brand-surface-bright/10 dark:border-white/5 space-y-1">
                  <span className="text-slate-400 font-medium">Teléfono / Administración</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{consorcio.telefono}</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface dark:bg-slate-900/40 p-6 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Resumen Operativo
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Este consorcio administra un total de{' '}
                <strong className="text-slate-800 dark:text-slate-100">{complejos.length} complejo(s) / edificio(s)</strong>.
                Todas las reglas de reserva de espacios comunes y reportes de incidencias quedan consolidadas bajo este perfil.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">Suscripción SaaS</span>
                <h4 className="text-xl font-black">{consorcio.planSaas || 'Plan Estándar'}</h4>
              </div>
              <ul className="text-xs space-y-2 text-blue-100 font-medium pt-2 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Multi-complejos e identificadores de torre.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Notificaciones push masivas para residentes.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Módulo de incidencias con fotos y estado.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Complejos (CU-CONS-03) */}
      {activeTab === 'complejos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Edificios y Complejos Asociados (CU-CONS-03)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestión de los inmuebles pertenecientes al consorcio {consorcio.nombre}.
              </p>
            </div>
            <button
              onClick={() => setIsAddComplejoOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Complejo</span>
            </button>
          </div>

          {isLoadingComplejos ? (
            <div className="p-8 text-center text-xs text-slate-500">Cargando edificios del consorcio...</div>
          ) : complejos.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-brand-surface dark:bg-slate-900/40 border border-brand-surface-bright/20 dark:border-white/10 space-y-3">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                No hay complejos asociados a este consorcio actualmente.
              </p>
              <button
                onClick={() => setIsAddComplejoOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Vincular Primer Complejo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complejos.map((complejo) => (
                <div
                  key={complejo.idComplejo}
                  className="p-5 rounded-3xl bg-brand-surface dark:bg-slate-900/40 border border-brand-surface-bright/20 dark:border-white/10 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {complejo.tipo}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {complejo.nombre}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{complejo.direccion}</span>
                    </div>
                  </div>

                  <Link
                    href={ROUTES.COMPLEJOS}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                    title="Ver en módulo de Complejos"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Personal (CU-CONS-04) */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Personal y Roles del Consorcio (CU-CONS-04)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administradores de edificio, encargados de seguridad y personal de mantenimiento asignados.
              </p>
            </div>
            <button
              onClick={() => setIsInvitePersonalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Users className="w-4 h-4" />
              <span>Invitar Colaborador</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalList.map((member) => {
              const rolConfig = {
                admin: { label: 'Administración', icon: Users, color: 'text-purple-600 bg-purple-500/10' },
                security: { label: 'Vigilancia', icon: Shield, color: 'text-amber-600 bg-amber-500/10' },
                maintenance: { label: 'Mantenimiento', icon: Wrench, color: 'text-emerald-600 bg-emerald-500/10' },
              };
              const cfg = rolConfig[member.rol];
              const Icon = cfg.icon;

              return (
                <div
                  key={member.id}
                  className="p-5 rounded-3xl bg-brand-surface dark:bg-slate-900/40 border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${cfg.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                          {member.nombre}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {member.cargo}
                        </span>
                      </div>
                    </div>
                    {member.estado === 'invited' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Invitación enviada
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-brand-surface-bright/10 dark:border-white/5 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.email}</span>
                    </div>
                    {member.complejoNombre && (
                      <div className="text-[11px] text-slate-400 font-medium">
                        Ámbito: {member.complejoNombre}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Métricas & Reportes (CU-CONS-06) */}
      {activeTab === 'metricas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Métricas y Reportes de Gestión (CU-CONS-06)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Indicadores de uso de amenities, rendimiento de mantenimiento y preparación de asambleas.
              </p>
            </div>
            <button
              onClick={handleExportReport}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Exportar Informe (PDF)</span>
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-brand-surface dark:bg-slate-900/40 border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Reservas del Mes</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">142</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>+18% vs mes anterior</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-brand-surface dark:bg-slate-900/40 border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Tasa Ocupación Amenities</span>
                <BarChart3 className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">76%</div>
              <div className="text-[11px] text-slate-400">Picos viernes y sábados</div>
            </div>

            <div className="p-5 rounded-3xl bg-brand-surface dark:bg-slate-900/40 border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Incidencias Resueltas</span>
                <Wrench className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">92%</div>
              <div className="text-[11px] text-slate-400">Tiempo medio: 1.4 días</div>
            </div>

            <div className="p-5 rounded-3xl bg-brand-surface dark:bg-slate-900/40 border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Residentes Activos</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">284</div>
              <div className="text-[11px] text-slate-400">De 310 unidades registradas</div>
            </div>
          </div>

          {/* Detailed Chart Breakdown */}
          <div className="bg-brand-surface dark:bg-slate-900/40 p-6 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Distribución de Demanda por Amenity
            </h4>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  <span>SUM Principal & Quincho</span>
                  <span>88% Ocupación</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[88%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  <span>Piscina & Solárium</span>
                  <span>72% Ocupación</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-[72%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  <span>Gimnasio & Fitness Center</span>
                  <span>65% Ocupación</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[65%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Comunicados (CU-CONS-07) */}
      {activeTab === 'comunicados' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Comunicados y Avisos Masivos (CU-CONS-07)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publicación de convocatorias, alertas y novedades oficiales a los residentes.
              </p>
            </div>
            <button
              onClick={() => setIsComunicadoOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
            >
              <Megaphone className="w-4 h-4" />
              <span>Nuevo Comunicado</span>
            </button>
          </div>

          <div className="space-y-3">
            {comunicadosList.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-brand-surface dark:bg-slate-900/40 border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        item.prioridad === 'urgente'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      }`}>
                        {item.prioridad === 'urgente' ? 'Urgente / Push' : 'Normal'}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {item.complejoNombre}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {item.titulo}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.fecha}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.contenido}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reglas & Amenities (CU-CONS-05) */}
      {activeTab === 'reglas' && (
        <div className="space-y-6">
          <div className="bg-brand-surface dark:bg-slate-900/40 p-6 rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Políticas Marco de Reservas y Uso de Espacios Comunes
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Reglas globales configuradas para todos los amenities de los complejos de este consorcio:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-brand-surface-bright/10 dark:border-white/5 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-100">Máximo de Reservas Activas</span>
                <p className="text-slate-500">Hasta 2 reservas activas simultáneas por unidad/departamento.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-brand-surface-bright/10 dark:border-white/5 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-100">Tiempo Límite de Cancelación</span>
                <p className="text-slate-500">Hasta 24 horas antes del turno reservado sin penalidad.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-brand-surface-bright/10 dark:border-white/5 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-100">Validación de Ingreso de Visitas</span>
                <p className="text-slate-500">El personal de seguridad debe validar planilla de reservas del día.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-brand-surface-bright/10 dark:border-white/5 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-100">Cierre Nocturno General</span>
                <p className="text-slate-500">Fin de turnos en SUM y Parrillas: 02:00 AM máximo.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales de la vista */}
      <ConsorcioFormModal
        isOpen={isEditConsorcioOpen}
        onClose={() => setIsEditConsorcioOpen(false)}
        onSubmit={handleUpdateConsorcio}
        initialData={consorcio}
        isSubmitLoading={isActionLoading}
      />

      <ComplejoFormModal
        isOpen={isAddComplejoOpen}
        onClose={() => setIsAddComplejoOpen(false)}
        onSubmit={handleCreateComplejo}
        initialData={null}
        consorcios={[consorcio]}
        isLoadingConsorcios={false}
        isSubmitLoading={isActionLoading}
      />

      <ConsorcioPersonalModal
        isOpen={isInvitePersonalOpen}
        onClose={() => setIsInvitePersonalOpen(false)}
        onSubmit={handleInvitePersonal}
        isSubmitLoading={isActionLoading}
        complejosOptions={complejos.map(c => ({ value: c.idComplejo.toString(), label: c.nombre }))}
      />

      <ConsorcioComunicadoModal
        isOpen={isComunicadoOpen}
        onClose={() => setIsComunicadoOpen(false)}
        onSubmit={handleCreateComunicado}
        isSubmitLoading={isActionLoading}
        complejosOptions={complejos.map(c => ({ value: c.idComplejo.toString(), label: c.nombre }))}
      />
    </div>
  );
}
