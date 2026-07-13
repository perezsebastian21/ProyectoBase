import React from 'react';
import PersonaList from '@/features/personas/components/PersonaList';

export const metadata = {
  title: 'Personas | Panel de Administración',
  description: 'Gestión del registro global de personas.',
};

export default function PersonasPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PersonaList />
    </div>
  );
}
