import React from 'react';
import UnidadList from '@/features/unidades/components/UnidadList';

export const metadata = {
  title: 'Unidades Habitacionales | Panel de Administración',
  description: 'Gestión de unidades habitacionales, lotes y departamentos.',
};

export default function UnidadesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <UnidadList />
    </div>
  );
}
