import React from 'react';
import UsuarioList from '@/features/usuarios/components/UsuarioList';

export const metadata = {
  title: 'Usuarios | Panel de Administración',
  description: 'Gestión de cuentas de usuario del sistema.',
};

export default function UsuariosPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <UsuarioList />
    </div>
  );
}
