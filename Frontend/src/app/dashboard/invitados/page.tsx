import React from 'react';
import InvitadoList from '@/features/invitados/components/InvitadoList';

export const metadata = {
  title: 'Invitados | Panel de Administración',
  description: 'Gestión de invitados de las unidades.',
};

export default function InvitadosPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <InvitadoList />
    </div>
  );
}
