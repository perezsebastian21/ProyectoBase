import React, { Suspense } from 'react';
import { AmenityList } from '@/features/amenities';

export const metadata = {
  title: 'Amenities | Panel de Administración',
  description: 'Gestión de espacios comunes y amenities.',
};

export default function AmenitiesPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <Suspense fallback={<div>Cargando...</div>}>
        <AmenityList />
      </Suspense>
    </div>
  );
}
