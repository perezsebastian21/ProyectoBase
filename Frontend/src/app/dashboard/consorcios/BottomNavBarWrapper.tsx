'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import BottomNavBar, { NavItem } from '@/components/ui/BottomNavBar';
import { ROUTES } from '@/constants';

export default function BottomNavBarWrapper() {
  const router = useRouter();
  const pathname = usePathname();

  // Compute active tab dynamically based on current path
  let activeTab: NavItem = 'inicio';
  if (pathname.includes('/dashboard/consorcios')) {
    activeTab = 'consorcios';
  } else if (pathname.includes('/dashboard/complejos')) {
    activeTab = 'complejos';
  }

  const handleTabChange = (tab: NavItem) => {
    if (tab === 'inicio') {
      router.push(ROUTES.DASHBOARD);
    } else if (tab === 'consorcios') {
      router.push(ROUTES.CONSORCIOS);
    } else if (tab === 'complejos') {
      router.push(ROUTES.COMPLEJOS);
    } else if (tab === 'perfil') {
      router.push('/?tab=perfil');
    }
  };

  return <BottomNavBar activeTab={activeTab} onChange={handleTabChange} />;
}
