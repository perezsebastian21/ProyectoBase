import React from 'react';
import PersonaList from '@/features/personas/components/PersonaList';

export const metadata = {
  title: 'Personas | Panel de Administración',
  description: 'Gestión del registro global de personas.',
};

export default function PersonasPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <PersonaList />
    </div>
  );
}
