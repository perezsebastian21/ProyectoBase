import React from 'react';
import { AuditLogList } from '@/features/audit-logs';

export const metadata = {
  title: 'Audit Logs | Panel de Administración',
  description: 'Historial de cambios y auditoría del sistema.',
};

export default function AuditLogsPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <AuditLogList />
    </div>
  );
}
