import React from 'react';
import { IncidenciaList } from '@/features/incidencias';

export const metadata = {
  title: 'Incidencias | Panel de Administración',
  description: 'Registro y seguimiento de incidencias en amenities.',
};

export default function IncidenciasPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <IncidenciaList />
    </div>
  );
}
