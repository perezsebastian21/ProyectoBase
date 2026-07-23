export type UserRole = 'SuperAdmin' | 'Consorcio' | 'Inquilino' | 'Invitado';

export interface RoleConfig {
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  iconBg: string;
  defaultRoute: string;
  features: string[];
}

export const USER_ROLES: Record<UserRole, RoleConfig> = {
  SuperAdmin: {
    id: 'SuperAdmin',
    title: 'Super Admin',
    subtitle: 'Administración Global',
    description: 'Acceso total para gestionar consorcios, complejos, unidades, usuarios y auditoría de la plataforma.',
    badge: 'Acceso Total',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    iconBg: 'from-purple-500 to-indigo-600',
    defaultRoute: '/',
    features: [
      'Gestión de Consorcios y Complejos',
      'Administración de Usuarios y Unidades',
      'Configuración de Amenities Globales',
      'Logs y Auditoría del Sistema'
    ]
  },
  Consorcio: {
    id: 'Consorcio',
    title: 'Consorcio',
    subtitle: 'Administrador de Edificio',
    description: 'Gestión operativa del edificio, control de reservas de residentes, mantenimientos y expensas.',
    badge: 'Gestión Edificio',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    gradient: 'from-blue-600 via-cyan-600 to-teal-500',
    iconBg: 'from-blue-500 to-cyan-600',
    defaultRoute: '/',
    features: [
      'Alta y Gestión de Amenities del Edificio',
      'Supervisión de Reservas de Residentes',
      'Gestión de Incidencias & Tareas',
      'Aprobación de Unidades e Inquilinos',
    ]
  },
  Inquilino: {
    id: 'Inquilino',
    title: 'Inquilino / Residente',
    subtitle: 'Propietario o Residente',
    description: 'Reserva de amenities del complejo, reporte de problemas, control de invitados y avisos del consorcio.',
    badge: 'Residente',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    iconBg: 'from-emerald-500 to-teal-600',
    defaultRoute: '/',
    features: [
      'Reserva rápida de SUM, Parrilla y Piscina',
      'Reporte directo de Incidencias',
      'Pases de acceso QR para Visitas',
      'Novedades y Noticias del Edificio'
    ]
  },
  Invitado: {
    id: 'Invitado',
    title: 'Invitado / Visita',
    subtitle: 'Acceso Temporal',
    description: 'Acceso simplificado para visitas temporales, confirmación de invitaciones a amenities y pases QR.',
    badge: 'Acceso Temporal',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    iconBg: 'from-amber-500 to-orange-600',
    defaultRoute: '/',
    features: [
      'Visualización de Pases QR de Ingreso',
      'Invitaciones a Amenities por Residentes',
      'Reglamento y Normas de Convivencia',
      'Contacto con Seguridad / Recepción'
    ]
  }
};
