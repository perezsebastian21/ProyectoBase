import type { Metadata } from 'next';
import ConsorcioList from '@/features/consorcios/components/ConsorcioList';
import TopAppBar from '@/components/ui/TopAppBar';
import BottomNavBarWrapper from './BottomNavBarWrapper';

export const metadata: Metadata = {
  title: 'Consorcios — Vantage Residential OS',
  description: 'Administra la lista de consorcios y datos de contacto de copropietarios.',
};

export default function ConsorciosPage() {
  return (
    <div className="min-h-screen bg-brand-background text-slate-800 dark:text-slate-100 flex flex-col font-sans pb-32 transition-colors duration-300">
      <TopAppBar
        title="Consorcios"
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <ConsorcioList />
      </main>

      <BottomNavBarWrapper />
    </div>
  );
}
