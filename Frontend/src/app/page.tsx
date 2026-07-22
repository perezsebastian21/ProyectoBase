'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardActionCard from '@/components/ui/DashboardActionCard';
import AmenityCard from '@/components/ui/AmenityCard';
import IncidentCard from '@/components/ui/IncidentCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { consorcioService } from '@/features/consorcios/services/consorcioService';
import { complejoService } from '@/features/complejos/services/complejoService';
import { ConsorcioExecutiveDashboard } from '@/features/dashboard';
import { ROUTES } from '@/constants';
import { roleService } from '@/lib/role-service';
import { USER_ROLES, UserRole } from '@/types/roles';
import { useConsorcioActivo } from '@/components/providers';

// Helper to decode JWT payload in the client
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Helper to get cookie value in the client
function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [consorciosCount, setConsorciosCount] = useState<number | null>(null);
  const [complejosCount, setComplejosCount] = useState<number | null>(null);
  const [consorciosList, setConsorciosList] = useState<any[]>([]);
  const [complejosList, setComplejosList] = useState<any[]>([]);
  const [selectedConsorcioId, setSelectedConsorcioId] = useState<string>('');
  const [selectedComplejoId, setSelectedComplejoId] = useState<string>('');
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>('SuperAdmin');

  // Context global de perfil activo
  const { consorcioActivo, complejoActivo, setConsorcioActivo, setComplejoActivo } = useConsorcioActivo();

  const [profileInfo, setProfileInfo] = useState<{
    username: string;
    expiration: string;
    token: string;
  }>({
    username: 'admin',
    expiration: '',
    token: ''
  });

  // Leer tab y rol activo al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = roleService.getActiveRole() || 'SuperAdmin';
      setActiveRole(role);

      const token = getCookie('auth_token') || '';
      let username = localStorage.getItem('auth_username') || '';
      let expirationRaw = localStorage.getItem('auth_expiration') || '';

      if (token && (!username || !expirationRaw)) {
        const decoded = decodeJWT(token);
        if (decoded) {
          const claimName = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
          if (!username && decoded[claimName]) {
            username = decoded[claimName];
          }
          if (!expirationRaw && decoded.exp) {
            expirationRaw = new Date(decoded.exp * 1000).toISOString();
          }
        }
      }

      if (!username) username = 'juancruz';

      let formattedExpiration = 'No disponible';
      if (expirationRaw) {
        try {
          const date = new Date(expirationRaw);
          formattedExpiration = date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) + ' hs';
        } catch (e) {
          formattedExpiration = expirationRaw;
        }
      }

      setProfileInfo({
        username,
        expiration: formattedExpiration,
        token
      });
    }
  }, []);

  // Cargar métricas al montar
  useEffect(() => {
    async function fetchCounts() {
      setIsLoadingCounts(true);
      try {
        const [consorciosRes, complejosRes] = await Promise.all([
          consorcioService.getAll(),
          complejoService.getAll(),
        ]);

        if (consorciosRes.success && consorciosRes.data) {
          setConsorciosCount(consorciosRes.data.length);
          setConsorciosList(consorciosRes.data);

          if (consorciosRes.data.length > 0) {
            // Si ya hay un consorcio activo guardado en el context (localStorage),
            // usarlo para inicializar el select. Si no, usar el primero como default.
            const savedConsorcio = consorcioActivo
              ? consorciosRes.data.find((c: any) => c.idConsorcio === consorcioActivo.id)
              : null;
            const toSelect = savedConsorcio ?? consorciosRes.data[0];
            setSelectedConsorcioId(toSelect.idConsorcio.toString());
            if (!consorcioActivo) {
              setConsorcioActivo({ id: toSelect.idConsorcio, nombre: toSelect.nombre });
            }
          }
        }

        if (complejosRes.success && complejosRes.data) {
          setComplejosCount(complejosRes.data.length);
          setComplejosList(complejosRes.data);

          if (complejosRes.data.length > 0) {
            // Mismo criterio: respetar el complejo guardado si existe
            const savedComplejo = complejoActivo
              ? complejosRes.data.find((c: any) => c.idComplejo === complejoActivo.id)
              : null;
            const toSelect = savedComplejo ?? complejosRes.data[0];
            setSelectedComplejoId(toSelect.idComplejo.toString());
            if (!complejoActivo) {
              setComplejoActivo({ id: toSelect.idComplejo, nombre: toSelect.nombre });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
      } finally {
        setIsLoadingCounts(false);
      }
    }

    fetchCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleLogout = () => {
    roleService.clearActiveRole();
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_username');
      localStorage.removeItem('auth_expiration');
    }
    router.push('/login');
  };

  const handleSwitchRole = () => {
    router.push('/select-role');
  };

  // Mock data para Amenities
  const mockAmenities = [
    {
      title: "Piscina Infinity & Solárium",
      imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=600&auto=format&fit=crop",
      statusLabel: "Disponible",
      status: "success" as const,
      capacity: 25,
      description: "Espectacular piscina climatizada con vista panorámica a la ciudad y área de reposeras de diseño.",
    },
    {
      title: "SUM / Parrilla Residencial Pro",
      imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
      statusLabel: "Reservado Hoy",
      status: "warning" as const,
      capacity: 15,
      description: "Salón de usos múltiples equipado con cocina industrial, vajilla premium y asador de última tecnología.",
    },
    {
      title: "Gimnasio & Centro de Bienestar",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
      statusLabel: "En Mantenimiento",
      status: "error" as const,
      capacity: 10,
      description: "Equipamiento de fuerza y cardio de alta gama con instructores disponibles e hidratación libre.",
    },
  ];

  // Render para SuperAdmin (Dashboard completo original)
  const renderSuperAdminDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Banner de Bienvenida */}
      <section className="relative overflow-hidden rounded-3xl border border-blue-100/60 dark:border-slate-800/50 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-brand-surface dark:from-slate-900/60 dark:via-slate-950/40 dark:to-slate-900/60 p-8 shadow-md shadow-blue-100/20 dark:shadow-none transition-all duration-300">
        <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 blur-2xl animate-pulse" />
        <div className="absolute right-20 -bottom-10 -z-10 h-36 w-36 rounded-full bg-emerald-400/10 dark:bg-emerald-400/20 blur-2xl" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Rol: SuperAdmin
              </span>
              <button
                onClick={handleSwitchRole}
                className="text-[10px] font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                (Cambiar Rol)
              </button>
            </div>
            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Livity OS — SuperAdmin
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md leading-relaxed">
              Gestión total del sistema, consorcios, complejos, unidades habitacionales y auditoría unificada.
            </p>
          </div>

          {/* Ilustración */}
          <div className="hidden md:flex items-center justify-center w-32 h-32 relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-emerald-400/20 rounded-full blur-xl animate-pulse" />
            <svg className="w-24 h-24 relative z-10 text-brand-primary dark:text-blue-400" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="85" cy="35" r="10" className="fill-emerald-400/20 dark:fill-emerald-400/30" />
              <rect x="25" y="30" width="22" height="65" rx="2" className="fill-slate-100/50 dark:fill-slate-800/50 stroke-brand-primary/30 dark:stroke-blue-400/40" strokeWidth="1.5" />
              <rect x="53" y="45" width="42" height="50" rx="3" className="fill-brand-surface stroke-brand-primary dark:stroke-blue-400" strokeWidth="2" />
              <rect x="61" y="55" width="8" height="8" rx="1.5" className="fill-brand-primary/10 stroke-brand-primary/30 dark:stroke-blue-400/30" strokeWidth="1" />
              <rect x="77" y="55" width="8" height="8" rx="1.5" className="fill-brand-primary/10 stroke-brand-primary/30 dark:stroke-blue-400/30" strokeWidth="1" />
              <line x1="10" y1="95" x2="110" y2="95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Módulos Administrativos */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-brand-surface-bright/20 pb-2">
          Módulos Administrativos Globale
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardActionCard
            category="Administración"
            title="Consorcios"
            badgeStatus={consorciosCount && consorciosCount > 0 ? 'success' : 'warning'}
            badgeLabel={isLoadingCounts ? 'Cargando...' : `${consorciosCount ?? 0} Activos`}
            description="Gestiona los consorcios del sistema, CUITs y datos de contacto oficiales."
            icon={
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            onClick={() => router.push(ROUTES.CONSORCIOS)}
          />

          <DashboardActionCard
            category="Inmuebles"
            title="Complejos & Edificios"
            badgeStatus={complejosCount && complejosCount > 0 ? 'success' : 'warning'}
            badgeLabel={isLoadingCounts ? 'Cargando...' : `${complejosCount ?? 0} Activos`}
            description="Registra y administra edificios o barrios cerrados asociados a cada consorcio."
            icon={
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
            onClick={() => router.push(ROUTES.COMPLEJOS)}
          />

          <DashboardActionCard
            category="Inmuebles"
            title="Unidades Habitacionales"
            badgeLabel="Activo"
            badgeStatus="success"
            description="Administración de unidades, departamentos o lotes vinculados a un complejo."
            icon={
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            onClick={() => router.push(ROUTES.UNIDADES)}
          />

          <DashboardActionCard
            category="Personas"
            title="Usuarios y Personas"
            badgeLabel="Activo"
            badgeStatus="success"
            description="Gestiona los perfiles de los usuarios y personas, incluyendo Inquilinos e Invitados."
            icon={
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            onClick={() => router.push(ROUTES.PERSONAS)}
          />

          <DashboardActionCard
            category="Espacios"
            title="Amenities"
            badgeLabel="Activo"
            badgeStatus="success"
            description="Administra los espacios comunes y sus reglas de uso (tarifas, bloqueos, etc)."
            icon={
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            onClick={() => router.push(ROUTES.AMENITIES_ADMIN)}
          />

          <DashboardActionCard
            category="Operaciones"
            title="Reservas & Listas"
            badgeLabel="Activo"
            badgeStatus="success"
            description="Supervisa y gestiona las reservas de los residentes y las colas de espera."
            icon={
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            onClick={() => router.push(ROUTES.RESERVAS_ADMIN)}
          />

          <DashboardActionCard
            category="Mantenimiento"
            title="Incidencias & Tareas"
            badgeLabel="Activo"
            badgeStatus="success"
            description="Administra reportes de roturas y programa mantenimientos preventivos."
            icon={
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            onClick={() => router.push(ROUTES.INCIDENCIAS_ADMIN)}
          />

          <DashboardActionCard
            category="Sistema"
            title="Auditoría"
            badgeLabel="Activo"
            badgeStatus="success"
            description="Verifica el historial completo de cambios en la plataforma."
            icon={
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            onClick={() => router.push(ROUTES.AUDIT_LOGS)}
          />
        </div>
      </section>
    </div>
  );

  // Render para Consorcio (Gestor de Edificio - Bento Grid Command Center)
  const renderConsorcioDashboard = () => (
    <ConsorcioExecutiveDashboard
      consorciosList={consorciosList}
      complejosList={complejosList}
      selectedConsorcioId={selectedConsorcioId}
      selectedComplejoId={selectedComplejoId}
      setSelectedConsorcioId={setSelectedConsorcioId}
      setSelectedComplejoId={setSelectedComplejoId}
      isLoadingCounts={isLoadingCounts}
      consorciosCount={consorciosCount}
      complejosCount={complejosCount}
      handleSwitchRole={handleSwitchRole}
    />
  );


  // Render para Inquilino / Residente
  const renderInquilinoDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Banner Residente */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-cyan-500/10 p-8 shadow-md transition-all">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Rol: Inquilino / Residente
              </span>
              <button onClick={handleSwitchRole} className="text-[10px] font-semibold text-brand-primary hover:underline cursor-pointer">
                (Cambiar Rol)
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              ¡Bienvenido a tu Espacio Residencial!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-lg leading-relaxed">
              Reservá espacios comunes, generá pases de invitados y reportá cualquier inconveniente de tu unidad.
            </p>
          </div>

          <button
            onClick={handleSwitchRole}
            className="px-4 py-2.5 rounded-2xl bg-brand-surface border border-brand-surface-bright/20 hover:border-brand-primary text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-all"
          >
            🔄 Cambiar Perfil
          </button>
        </div>
      </section>

      {/* Amenities recomendados para reservar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-surface-bright/20 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Amenities Disponibles para Reservar
          </h3>
          <span className="text-xs text-brand-primary font-semibold">Torre 1 • Depto 4B</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {mockAmenities.map((amenity, idx) => (
            <AmenityCard
              key={idx}
              title={amenity.title}
              imageUrl={amenity.imageUrl}
              statusLabel={amenity.statusLabel}
              status={amenity.status}
              capacity={amenity.capacity}
              description={amenity.description}
              onBookClick={() => router.push(ROUTES.RESERVAS_ADMIN)}
            />
          ))}
        </div>
      </section>
    </div>
  );

  // Render para Invitado / Visita
  const renderInvitadoDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Banner Invitado */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 p-8 shadow-md transition-all">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Rol: Invitado / Visita
              </span>
              <button onClick={handleSwitchRole} className="text-[10px] font-semibold text-brand-primary hover:underline cursor-pointer">
                (Cambiar Rol)
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              Pase de Acceso & Visitas
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-lg leading-relaxed">
              Consulta las autorizaciones de ingreso a la propiedad, invitaciones a eventos y normas del edificio.
            </p>
          </div>

          <button
            onClick={handleSwitchRole}
            className="px-4 py-2.5 rounded-2xl bg-brand-surface border border-brand-surface-bright/20 hover:border-brand-primary text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-all"
          >
            🔄 Cambiar Perfil
          </button>
        </div>
      </section>

      {/* Tarjeta de Pase QR de Ejemplo */}
      <section className="max-w-md mx-auto rounded-3xl border border-amber-500/30 bg-brand-surface p-6 shadow-lg text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pase Temporal Activo</h3>
          <p className="text-xs text-slate-500">Válido para hoy de 18:00 a 23:59 hs</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 inline-block shadow-inner">
          {/* QR mock SVG */}
          <svg className="w-36 h-36 mx-auto text-slate-800 dark:text-slate-100" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 10h30v30H10zM15 15v20h20V15zM20 20h10v10H20zM60 10h30v30H60zM65 15v20h20V15zM70 20h10v10H70zM10 60h30v30H10zM15 65v20h20V65zM20 70h10v10H20zM50 50h10v10H50zM70 50h20v10H70zM50 70h20v20H50zM80 80h10v10H80z" />
          </svg>
        </div>

        <p className="text-xs text-slate-400">
          Presentá este código QR en la guardia de ingreso al ingresar al complejo.
        </p>
      </section>
    </div>
  );

  // Renderizar vistas según pestaña activa
  const currentTab = searchParams.get('tab') === 'perfil' ? 'perfil' : 'inicio';

  const renderContent = () => {
    switch (currentTab) {
      case 'inicio':
        switch (activeRole) {
          case 'Consorcio':
            return renderConsorcioDashboard();
          case 'Inquilino':
            return renderInquilinoDashboard();
          case 'Invitado':
            return renderInvitadoDashboard();
          case 'SuperAdmin':
          default:
            return renderSuperAdminDashboard();
        }

      case 'perfil':
        const roleConfig = USER_ROLES[activeRole] || USER_ROLES.SuperAdmin;

        return (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <div className="pb-2 border-b border-brand-surface-bright/20 text-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Mi Perfil</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Configuración de cuenta y rol de usuario</p>
            </div>

            <div className="rounded-3xl border border-brand-surface-bright/20 dark:border-white/5 bg-brand-surface dark:bg-slate-900/20 p-6 shadow-sm dark:shadow-none space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary to-emerald-400 p-[3px] shadow-lg shadow-brand-primary/10 dark:shadow-brand-primary/20">
                  <div className="w-full h-full bg-brand-surface dark:bg-slate-950 rounded-full flex items-center justify-center border border-brand-surface-bright/20 dark:border-slate-900">
                    <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{profileInfo.username}</h3>
                  <span className={`inline-block mt-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${roleConfig.badgeColor}`}>
                    Rol: {roleConfig.title}
                  </span>
                </div>
              </div>

              {/* Action: Cambiar de Rol */}
              <button
                onClick={handleSwitchRole}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Cambiar de Rol / Perfil
              </button>

              {/* Profile Fields */}
              <div className="space-y-4 pt-4 border-t border-brand-surface-bright/10 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between py-1 border-b border-brand-surface-bright/10 dark:border-white/5">
                  <span className="font-medium">Usuario</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{profileInfo.username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-surface-bright/10 dark:border-white/5">
                  <span className="font-medium">Rol Activo</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{roleConfig.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-surface-bright/10 dark:border-white/5">
                  <span className="font-medium">Expiración Sesión</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{profileInfo.expiration}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-surface-bright/10 dark:border-white/5">
                  <span className="font-medium">Token JWT</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono text-[10px] tracking-tight truncate max-w-[180px] font-semibold" title={profileInfo.token}>
                    {profileInfo.token ? `${profileInfo.token.slice(0, 10)}...${profileInfo.token.slice(-8)}` : 'No disponible'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      {renderContent()}
    </div>
  );
}
