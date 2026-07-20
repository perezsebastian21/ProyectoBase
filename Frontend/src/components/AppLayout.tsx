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
    } else {
      // Si estamos en otra ruta, podríamos no tener nada activo en la navbar
      setActiveTab('');
    }
  }, [pathname, searchParams]);

  // Pantallas que NO deben mostrar el layout global (Auth)
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  if (isAuthRoute) {
    return <>{children}</>;
  }

  const handleTabChange = (tab: NavItem | string) => {
    if (tab === 'inicio') {
      router.push('/');
    } else if (tab === 'consorcios') {
      router.push(ROUTES.CONSORCIOS);
    } else if (tab === 'complejos') {
      router.push(ROUTES.COMPLEJOS);
    } else if (tab === 'perfil') {
      router.push('/?tab=perfil');
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

      {/* Floating Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}
