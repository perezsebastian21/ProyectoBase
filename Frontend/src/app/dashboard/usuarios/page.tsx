import React from 'react';
import UsuarioList from '@/features/usuarios/components/UsuarioList';

export const metadata = {
  title: 'Usuarios | Panel de Administración',
  description: 'Gestión de cuentas de usuario del sistema.',
};

export default function UsuariosPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <UsuarioList />
    </div>
  );
}
