import type { Metadata } from 'next';
import ComplejoList from '@/features/complejos/components/ComplejoList';

export const metadata: Metadata = {
  title: 'Complejos — Vantage Residential OS',
  description: 'Administra la lista de complejos de departamentos, barrios o edificios residenciales.',
};

export default function ComplejosPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <ComplejoList />
    </div>
  );
}
