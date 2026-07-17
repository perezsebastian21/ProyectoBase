import React from 'react';
import { IncidenciaList } from '@/features/incidencias';

export const metadata = {
  title: 'Incidencias | Panel de Administración',
  description: 'Registro y seguimiento de incidencias en amenities.',
};

export default function IncidenciasPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <IncidenciaList />
    </div>
  );
}
