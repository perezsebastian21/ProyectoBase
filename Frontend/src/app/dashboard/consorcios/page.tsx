import type { Metadata } from 'next';
import ConsorcioList from '@/features/consorcios/components/ConsorcioList';

export const metadata: Metadata = {
  title: 'Consorcios — Vantage Residential OS',
  description: 'Administra la lista de consorcios y datos de contacto de copropietarios.',
};

export default function ConsorciosPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <ConsorcioList />
    </div>
  );
}
