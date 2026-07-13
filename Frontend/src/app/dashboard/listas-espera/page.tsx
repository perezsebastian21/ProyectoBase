import React from 'react';
import { ListaEsperaList } from '@/features/listas-espera';

export const metadata = {
  title: 'Listas de Espera | Panel de Administración',
  description: 'Gestión de listas de espera para reservas.',
};

export default function ListasEsperaPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ListaEsperaList />
    </div>
  );
}
