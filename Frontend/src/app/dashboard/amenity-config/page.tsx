import React from 'react';
import { AmenityConfigList } from '@/features/amenities';

export const metadata = {
  title: 'Configuraciones de Amenities | Panel de Administración',
  description: 'Gestión de reglas de uso de amenities.',
};

export default function AmenityConfigPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AmenityConfigList />
    </div>
  );
}
