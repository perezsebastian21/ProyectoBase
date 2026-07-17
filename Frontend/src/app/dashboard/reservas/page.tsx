import React from 'react';
import { ReservaList } from '@/features/reservas';

export const metadata = {
  title: 'Reservas | Panel de Administración',
  description: 'Gestión de reservas de los amenities.',
};

export default function ReservasPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <ReservaList />
    </div>
  );
}
