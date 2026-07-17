import React from 'react';
import { MantenimientoList } from '@/features/mantenimientos';

export const metadata = {
  title: 'Mantenimientos Programados | Panel de Administración',
  description: 'Programación de mantenimientos de amenities.',
};

export default function MantenimientosPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <MantenimientoList />
    </div>
  );
}
