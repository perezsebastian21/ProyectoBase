import React from 'react';
import { AuditLogList } from '@/features/audit-logs';

export const metadata = {
  title: 'Audit Logs | Panel de Administración',
  description: 'Historial de cambios y auditoría del sistema.',
};

export default function AuditLogsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AuditLogList />
    </div>
  );
}
