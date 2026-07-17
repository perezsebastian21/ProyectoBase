import React from 'react';
import UnidadList from '@/features/unidades/components/UnidadList';

export const metadata = {
  title: 'Unidades Habitacionales | Panel de Administración',
  description: 'Gestión de unidades habitacionales, lotes y departamentos.',
};

export default function UnidadesPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <UnidadList />
    </div>
  );
}
