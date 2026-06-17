'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopAppBar from '@/components/ui/TopAppBar';
import BottomNavBar, { NavItem } from '@/components/ui/BottomNavBar';
import DashboardActionCard from '@/components/ui/DashboardActionCard';
import AmenityCard from '@/components/ui/AmenityCard';
import IncidentCard from '@/components/ui/IncidentCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { consorcioService } from '@/features/consorcios/services/consorcioService';
import { complejoService } from '@/features/complejos/services/complejoService';
import { ROUTES } from '@/constants';

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
  const [activeTab, setActiveTab] = useState<NavItem>('inicio');
  const [consorciosCount, setConsorciosCount] = useState<number | null>(null);
  const [complejosCount, setComplejosCount] = useState<number | null>(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  const [profileInfo, setProfileInfo] = useState<{
    username: string;
    expiration: string;
    token: string;
  }>({
    username: 'admin',
    expiration: '',
    token: ''
  });

  // Leer tab de los query params y cargar datos de sesión al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Leer Tab
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'perfil') {
        setActiveTab('perfil');
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // 2. Leer Sesión
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

  const handleTabChange = (tab: NavItem) => {
    if (tab === 'inicio') {
      setActiveTab('inicio');
    } else if (tab === 'consorcios') {
      router.push(ROUTES.CONSORCIOS);
    } else if (tab === 'complejos') {
      router.push(ROUTES.COMPLEJOS);
    } else if (tab === 'perfil') {
      setActiveTab('perfil');
    }
  };

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
        }
        if (complejosRes.success && complejosRes.data) {
          setComplejosCount(complejosRes.data.length);
        }
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
      } finally {
        setIsLoadingCounts(false);
      }
    }

    fetchCounts();
  }, []);

  const handleLogout = () => {
    // Eliminar la cookie de sesión y redirigir
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_username');
      localStorage.removeItem('auth_expiration');
    }
    router.push('/login');
  };

  // Mock data para Amenities (Comunidad)
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

  // Mock data para Incidencias
  const mockIncidents = [
    {
      id: "1032",
      title: "Filtración en techo de garage subterráneo",
      category: "Mantenimiento General",
      priority: "Alta" as const,
      statusLabel: "Urgente",
      status: "error" as const,
      timeLabel: "Hace 2 horas",
      reporterName: "Carlos Gómez",
    },
    {
      id: "1028",
      title: "Luz piloto de ascensor principal parpadeando",
      category: "Ascensores",
      priority: "Media" as const,
      statusLabel: "En Proceso",
      status: "warning" as const,
      timeLabel: "Ayer",
      reporterName: "Sofía Martínez",
    },
  ];

  // Renderizar vistas según pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Welcome Banner */}
            <section className="relative overflow-hidden rounded-3xl border border-blue-100/60 dark:border-slate-800/50 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-brand-surface dark:from-slate-900/60 dark:via-slate-950/40 dark:to-slate-900/60 p-8 shadow-md shadow-blue-100/20 dark:shadow-none transition-all duration-300">
              {/* Background gradient bubbles */}
              <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 blur-2xl animate-pulse" />
              <div className="absolute right-20 -bottom-10 -z-10 h-36 w-36 rounded-full bg-emerald-400/10 dark:bg-emerald-400/20 blur-2xl" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 flex-1">
                  <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    Livity OS
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md leading-relaxed">
                    Gestiona tu edificio, amenities, consorcios y reportes de incidencias desde un panel de control unificado y premium.
                  </p>
                </div>

                {/* Minimalist modern building illustration */}
                <div className="hidden md:flex items-center justify-center w-32 h-32 relative flex-shrink-0">
                  {/* Glowing background behind illustration */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-emerald-400/20 rounded-full blur-xl animate-pulse" />

                  <svg className="w-24 h-24 relative z-10 text-brand-primary dark:text-blue-400" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Sun/Orb */}
                    <circle cx="85" cy="35" r="10" className="fill-emerald-400/20 dark:fill-emerald-400/30" />

                    {/* Building 1 (Back, Tall) */}
                    <rect x="25" y="30" width="22" height="65" rx="2" className="fill-slate-100/50 dark:fill-slate-800/50 stroke-brand-primary/30 dark:stroke-blue-400/40" strokeWidth="1.5" />
                    {/* Windows Building 1 */}
                    <line x1="31" y1="42" x2="41" y2="42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
                    <line x1="31" y1="52" x2="41" y2="52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
                    <line x1="31" y1="62" x2="41" y2="62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
                    <line x1="31" y1="72" x2="41" y2="72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
                    <line x1="31" y1="82" x2="41" y2="82" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />

                    {/* Building 2 (Front, Short/Wide) */}
                    <rect x="53" y="45" width="42" height="50" rx="3" className="fill-brand-surface stroke-brand-primary dark:stroke-blue-400" strokeWidth="2" />
                    {/* Windows Building 2 */}
                    <rect x="61" y="55" width="8" height="8" rx="1.5" className="fill-brand-primary/10 stroke-brand-primary/30 dark:stroke-blue-400/30" strokeWidth="1" />
                    <rect x="77" y="55" width="8" height="8" rx="1.5" className="fill-brand-primary/10 stroke-brand-primary/30 dark:stroke-blue-400/30" strokeWidth="1" />
                    <rect x="61" y="71" width="8" height="8" rx="1.5" className="fill-brand-primary/10 stroke-brand-primary/30 dark:stroke-blue-400/30" strokeWidth="1" />
                    <rect x="77" y="71" width="8" height="8" rx="1.5" className="fill-brand-primary/10 stroke-brand-primary/30 dark:stroke-blue-400/30" strokeWidth="1" />

                    {/* Door */}
                    <path d="M69 95 V87 C69 85.9 69.9 85 71 85 H75 C76.1 85 77 85.9 77 87 V95" className="stroke-brand-primary dark:stroke-blue-400" strokeWidth="1.5" />

                    {/* Decorative Plants/Trees */}
                    <circle cx="18" cy="91" r="4" className="fill-emerald-500/80 dark:fill-emerald-400" />
                    <circle cx="102" cy="91" r="5" className="fill-emerald-500/80 dark:fill-emerald-400" />
                    <line x1="18" y1="91" x2="18" y2="95" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="102" y1="91" x2="102" y2="95" stroke="currentColor" strokeWidth="1.5" />

                    {/* Ground Line */}
                    <line x1="10" y1="95" x2="110" y2="95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </section>

            {/* Administration Cards */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-brand-surface-bright/20 pb-2">
                Módulos Administrativos
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
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
              </div>
            </section>

            {/* Quick stats and help banner */}
            <section className="p-6 rounded-3xl bg-brand-surface-container/30 border border-brand-surface-bright/5 text-xs text-slate-400 leading-relaxed">
              💡 <strong>Configuración inicial</strong>: Recuerda que para registrar un Complejo, primero debes crear el Consorcio correspondiente para poder asociar sus identificadores.
            </section>
          </div>
        );



      case 'perfil':
        return (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <div className="pb-2 border-b border-brand-surface-bright/20 text-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Mi Perfil</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Configuración de cuenta y datos de residencia</p>
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
                  <p className="text-xs text-brand-primary font-semibold uppercase tracking-wider mt-0.5">Administrador</p>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-4 pt-4 border-t border-brand-surface-bright/10 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between py-1 border-b border-brand-surface-bright/10 dark:border-white/5">
                  <span className="font-medium">Usuario</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{profileInfo.username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-surface-bright/10 dark:border-white/5">
                  <span className="font-medium">Rol Asignado</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">Administrador</span>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-surface-bright/10 dark:border-white/5">
                  <span className="font-medium">Expiración</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{profileInfo.expiration}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-surface-bright/10 dark:border-white/5">
                  <span className="font-medium">Token JWT</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono text-[10px] tracking-tight truncate max-w-[180px] font-semibold" title={profileInfo.token}>
                    {profileInfo.token ? `${profileInfo.token.slice(0, 10)}...${profileInfo.token.slice(-8)}` : 'No disponible'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-surface-bright/10 dark:border-white/5">
                  <span className="font-medium">Estado</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Sesión Activa</span>
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
    <div className="min-h-screen bg-brand-background text-slate-800 dark:text-slate-100 flex flex-col font-sans pb-32 transition-colors duration-300">
      <TopAppBar
        title="Livity OS"
        onAvatarClick={() => setActiveTab('perfil')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {renderContent()}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}
