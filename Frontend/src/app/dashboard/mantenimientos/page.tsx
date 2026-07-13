import React from 'react';
import { MantenimientoList } from '@/features/mantenimientos';

export const metadata = {
  title: 'Mantenimientos Programados | Panel de Administración',
  description: 'Programación de mantenimientos de amenities.',
};

export default function MantenimientosPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <MantenimientoList />
    </div>
  );
}
