"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import TopAppBar from './ui/TopAppBar';
import BottomNavBar, { NavItem } from './ui/BottomNavBar';
import { ROUTES } from '@/constants/routes';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<NavItem | string>('inicio');

  // Determinar la pestaña activa basándose en la ruta y los parámetros
  useEffect(() => {
    if (pathname === '/') {
      const tabParam = searchParams.get('tab');
      if (tabParam === 'perfil') {
        setActiveTab('perfil');
      } else {
        setActiveTab('inicio');
      }
    } else if (pathname.startsWith('/dashboard/consorcios')) {
      setActiveTab('consorcios');
    } else if (pathname.startsWith('/dashboard/complejos')) {
      setActiveTab('complejos');
    } else if (pathname.startsWith('/dashboard/reservas')) {
      setActiveTab('reservas');
    } else if (pathname.startsWith('/dashboard/incidencias')) {
      setActiveTab('incidencias');
    } else if (pathname.startsWith('/dashboard/amenities')) {
      setActiveTab('amenities');
    } else {
      setActiveTab('');
    }
  }, [pathname, searchParams]);

  // Pantallas que NO deben mostrar el layout global (Auth y Selección de Rol)
  const isAuthOrRoleRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/select-role';

  if (isAuthOrRoleRoute) {
    return <>{children}</>;
  }

  const handleTabChange = (tab: NavItem | string) => {
    switch (tab) {
      case 'inicio':
        router.push('/');
        break;
      case 'consorcios':
        router.push(ROUTES.CONSORCIOS);
        break;
      case 'complejos':
        router.push(ROUTES.COMPLEJOS);
        break;
      case 'reservas':
        router.push(ROUTES.RESERVAS_ADMIN);
        break;
      case 'incidencias':
        router.push(ROUTES.INCIDENCIAS_ADMIN);
        break;
      case 'amenities':
        router.push(ROUTES.AMENITIES_ADMIN);
        break;
      case 'pase':
        router.push('/');
        break;
      case 'perfil':
        router.push('/?tab=perfil');
        break;
      default:
        router.push('/');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background text-slate-800 dark:text-slate-100 flex flex-col font-sans pb-32 transition-colors duration-300">
      <TopAppBar
        title="Livity OS"
        onAvatarClick={() => router.push('/?tab=perfil')}
      />

      <main className="flex-1 w-full mx-auto">
        {children}
      </main>

      {/* Floating Bottom Navigation (Adaptativa por rol) */}
      <BottomNavBar activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}
