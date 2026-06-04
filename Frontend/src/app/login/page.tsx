import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Iniciar sesión — Vantage Residential OS',
  description: 'Accedé a tu cuenta de Vantage Residential OS para gestionar amenities, reservas e incidentes de tu edificio.',
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
