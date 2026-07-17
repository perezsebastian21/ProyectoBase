import React from 'react';
import InquilinoList from '@/features/inquilinos/components/InquilinoList';

export const metadata = {
  title: 'Inquilinos | Panel de Administración',
  description: 'Gestión de inquilinos de las unidades.',
};

export default function InquilinosPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <InquilinoList />
    </div>
  );
}
