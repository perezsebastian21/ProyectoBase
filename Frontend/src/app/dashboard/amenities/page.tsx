import React from 'react';
import { AmenityList } from '@/features/amenities';

export const metadata = {
  title: 'Amenities | Panel de Administración',
  description: 'Gestión de espacios comunes y amenities.',
};

export default function AmenitiesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AmenityList />
    </div>
  );
}
