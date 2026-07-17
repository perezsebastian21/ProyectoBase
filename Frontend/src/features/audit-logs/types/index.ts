export interface AuditLog {
  idAuditLog: number;
  usuario: string;
  accion: string;
  entidad: string;
  entidadId: number;
  fechaHora: string;
  detalle: string;
}
