import React from 'react';
import InquilinoList from '@/features/inquilinos/components/InquilinoList';

export const metadata = {
  title: 'Inquilinos | Panel de Administración',
  description: 'Gestión de inquilinos de las unidades.',
};

export default function InquilinosPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <InquilinoList />
    </div>
  );
}
