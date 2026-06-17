import type { Metadata } from 'next';
import ComplejoList from '@/features/complejos/components/ComplejoList';
import TopAppBar from '@/components/ui/TopAppBar';
import BottomNavBarWrapper from '../consorcios/BottomNavBarWrapper';

export const metadata: Metadata = {
  title: 'Complejos — Vantage Residential OS',
  description: 'Administra la lista de complejos de departamentos, barrios o edificios residenciales.',
};

export default function ComplejosPage() {
  return (
    <div className="min-h-screen bg-brand-background text-slate-800 dark:text-slate-100 flex flex-col font-sans pb-32 transition-colors duration-300">
      <TopAppBar
        title="Complejos"
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <ComplejoList />
      </main>

      <BottomNavBarWrapper />
    </div>
  );
}
