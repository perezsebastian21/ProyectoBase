export type UserRole =
  | 'SUPER_ADMINISTRADOR'
  | 'ADMINISTRADOR_AVANZADO'
  | 'ADMINISTRADOR_LIVIANO'
  | 'GUARDIA'
  | 'INQUILINO'
  | 'PROPIETARIO'
  | 'INVITADO';

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
  SUPER_ADMINISTRADOR: {
    id: 'SUPER_ADMINISTRADOR',
    title: 'Super Administrador',
    subtitle: 'Administración Global Cross-Tenant',
    description: 'Acceso total para onboarding de consorcios (CU-08), complejos, unidades, gestión de presets globales y auditoría.',
    badge: 'Super Admin',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    iconBg: 'from-purple-500 to-indigo-600',
    defaultRoute: '/',
    features: [
      'Onboarding Consorcio / Complejo (CU-08)',
      'Gestión Global de Presets y AmenityConfig',
      'Supervisión y Auditoría Cross-Tenant (CU-09)',
      'Gestión de Administradores Avanzados'
    ]
  },
  ADMINISTRADOR_AVANZADO: {
    id: 'ADMINISTRADOR_AVANZADO',
    title: 'Admin Avanzado',
    subtitle: 'Administrador Completo del Consorcio',
    description: 'Gestión total del consorcio: configuración de amenities (CU-08b), sanciones a unidades (CU-06), reportes (CU-09), mantenimiento programado (CU-10) y cancelación masiva (CU-14).',
    badge: 'Admin Avanzado',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    gradient: 'from-blue-600 via-cyan-600 to-teal-500',
    iconBg: 'from-blue-500 to-cyan-600',
    defaultRoute: '/',
    features: [
      'Configuración Avanzada de Amenities & Políticas (CU-08b)',
      'Sanción y Suspensión de Unidades (CU-06)',
      'Mantenimientos Programados y Días Excepcionales (CU-10)',
      'Cancelación Masiva por Fuera de Servicio (CU-14)'
    ]
  },
  ADMINISTRADOR_LIVIANO: {
    id: 'ADMINISTRADOR_LIVIANO',
    title: 'Admin Liviano',
    subtitle: 'Consorcio sin Guardia Dedicado',
    description: 'Operación del día a día en edificios sin guardia: aprobación de reservas (CU-01), bloqueos puntuales (CU-04) y control de portería (CU-03).',
    badge: 'Admin Liviano',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    gradient: 'from-sky-600 via-blue-600 to-indigo-600',
    iconBg: 'from-sky-500 to-blue-600',
    defaultRoute: '/',
    features: [
      'Aprobación / Rechazo de Reservas (CU-01)',
      'Control de Acceso e Invitados en Portería (CU-03)',
      'Bloqueo Puntual de Amenity por Incidencia (CU-04)',
      'Supervisión de Reservas del Edificio'
    ]
  },
  GUARDIA: {
    id: 'GUARDIA',
    title: 'Guardia / Portería',
    subtitle: 'Seguridad y Control de Acceso',
    description: 'Módulo de portería exclusivo (CU-03) en consorcios con guardia dedicado: validación DNI de invitados, registro de ingresos/egresos, Check-in de reservas y reporte de incidencias (CU-02).',
    badge: 'Portería',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    iconBg: 'from-amber-500 to-orange-600',
    defaultRoute: '/dashboard/acceso',
    features: [
      'Validación de Invitados por DNI (CU-03)',
      'Registro de Ingreso y Egreso en Tiempo Real',
      'Marcación de Check-in en Reservas (CU-01)',
      'Reporte de Incidencias en Recorrida (CU-02)'
    ]
  },
  INQUILINO: {
    id: 'INQUILINO',
    title: 'Inquilino / Residente',
    subtitle: 'Residente Activo de la Unidad',
    description: 'Operación diaria del residente: consulta de disponibilidad (CU-12), reserva de amenities (CU-01), lista de espera (CU-05), reporte de problemas (CU-02) y pago (CU-07).',
    badge: 'Inquilino',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    iconBg: 'from-emerald-500 to-teal-600',
    defaultRoute: '/',
    features: [
      'Consulta de Disponibilidad por Grilla Horaria (CU-12)',
      'Reserva Directa y Pago de Amenities (CU-01 / CU-07)',
      'Lista de Espera con Holds y Confirmación (CU-05)',
      'Registro de Invitados y Pase QR (CU-03)'
    ]
  },
  PROPIETARIO: {
    id: 'PROPIETARIO',
    title: 'Propietario',
    subtitle: 'Supervisión y Gestión Multi-Unidad',
    description: 'Acceso como residente si habita la unidad, más panel de supervisión de todas sus propiedades (BR-AUTH-010), revisión de reservas de inquilinos y aprobación previa de reservas (BR-AUTH-013).',
    badge: 'Propietario',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    gradient: 'from-teal-600 via-emerald-600 to-green-600',
    iconBg: 'from-teal-500 to-emerald-600',
    defaultRoute: '/dashboard/mis-unidades',
    features: [
      'Panel de Supervisión Multi-Propiedad (BR-AUTH-010)',
      'Aprobación de Reservas de Inquilinos (BR-AUTH-013)',
      'Consulta de Estado de Expensas y Sanciones',
      'Baja y Cambio de Inquilinos (CU-11)'
    ]
  },
  INVITADO: {
    id: 'INVITADO',
    title: 'Invitado / Visita',
    subtitle: 'Acceso Temporal',
    description: 'Acceso simplificado para visitas temporales, confirmación de invitaciones a amenities y pases QR.',
    badge: 'Acceso Temporal',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    gradient: 'from-slate-500 via-zinc-600 to-neutral-700',
    iconBg: 'from-slate-500 to-zinc-600',
    defaultRoute: '/',
    features: [
      'Visualización de Pases QR de Ingreso',
      'Invitaciones a Amenities por Residentes',
      'Reglamento y Normas de Convivencia',
      'Contacto con Seguridad / Recepción'
    ]
  }
};
