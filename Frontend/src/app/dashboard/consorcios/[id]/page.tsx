import type { Metadata } from 'next';
import { ConsorcioDetailView } from '@/features/consorcios';

export const metadata: Metadata = {
  title: 'Detalle de Consorcio — Vantage Residential OS',
  description: 'Administración de complejos, personal y políticas marco del consorcio.',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConsorcioDetailPage({ params }: PageProps) {
  const { id } = await params;
  const consorcioId = parseInt(id, 10);

  return (
    <div className="max-w-6xl w-full mx-auto px-6 py-8">
      <ConsorcioDetailView consorcioId={consorcioId} />
    </div>
  );
}
