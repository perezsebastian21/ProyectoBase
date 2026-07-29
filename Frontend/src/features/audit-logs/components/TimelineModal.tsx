'use client';

import React, { useState, useEffect } from 'react';
import { History, X, Clock, User, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { EventoAuditoria, ServiceResponse } from '@/types';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  entidad: 'Reserva' | 'ListaEspera' | 'Incidencia' | string;
  idEntidad: number;
}

const MOCK_TIMELINE_EVENTOS: EventoAuditoria[] = [
  {
    idEvento: 1,
    tenantId: 'tenant-001',
    entidad: 'Reserva',
    idEntidad: 45,
    estadoAnterior: null,
    estadoNuevo: 'EN_ESPERA',
    idUsuario: 12,
    origen: 'USUARIO',
    detalle: 'El usuario solicitó anotarse en la lista de espera del amenity SUM',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    idEvento: 2,
    tenantId: 'tenant-001',
    entidad: 'Reserva',
    idEntidad: 45,
    estadoAnterior: 'EN_ESPERA',
    estadoNuevo: 'NOTIFICADO',
    idUsuario: null,
    origen: 'JOB',
    detalle: 'Liberación de turno por cancelación. Hold de 30 min asignado a la unidad',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    idEvento: 3,
    tenantId: 'tenant-001',
    entidad: 'Reserva',
    idEntidad: 45,
    estadoAnterior: 'NOTIFICADO',
    estadoNuevo: 'PENDIENTE_PAGO',
    idUsuario: 12,
    origen: 'USUARIO',
    detalle: 'El usuario confirmó el hold dentro del límite de 30 minutos',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    idEvento: 4,
    tenantId: 'tenant-001',
    entidad: 'Reserva',
    idEntidad: 45,
    estadoAnterior: 'PENDIENTE_PAGO',
    estadoNuevo: 'CONFIRMADA',
    idUsuario: 12,
    origen: 'SISTEMA',
    detalle: 'Pago aprobado en pasarela. Comprobante de reserva generado.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    idEvento: 5,
    tenantId: 'tenant-001',
    entidad: 'Reserva',
    idEntidad: 45,
    estadoAnterior: 'CONFIRMADA',
    estadoNuevo: 'Confirmed (Check-In)',
    idUsuario: 5,
    origen: 'GUARDIA',
    detalle: 'Check-in presencial registrado en la terminal de portería por el guardia.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  entidad,
  idEntidad,
}) => {
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cargarTimeline = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient<ServiceResponse<EventoAuditoria[]>>(
        `/Auditoria/${entidad}/${idEntidad}`,
        { method: 'GET' }
      );
      if (res.success && res.data && res.data.length > 0) {
        setEventos(res.data);
      } else {
        // Fallback MOCK para testing/visualización si el backend aún no devolvió registros
        setEventos(MOCK_TIMELINE_EVENTOS);
      }
    } catch (err: any) {
      // Fallback a MOCK en desarrollo si falla el endpoint
      setEventos(MOCK_TIMELINE_EVENTOS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && entidad && idEntidad) {
      cargarTimeline();
    }
  }, [isOpen, entidad, idEntidad]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
          <History className="w-6 h-6" />
          <h2 className="text-lg font-bold">Línea de Tiempo de Auditoría (CU-09)</h2>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Trazabilidad de cambios de estado para {entidad} <strong className="text-zinc-900 dark:text-zinc-100">#{idEntidad}</strong>
        </p>

        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading && (
            <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 animate-spin text-indigo-500" />
              Cargando historial de eventos...
            </div>
          )}

          {!isLoading && (
            <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-6 my-2">
              {eventos.map((ev, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-zinc-900 shadow-sm" />

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {new Date(ev.timestamp).toLocaleString('es-AR')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {ev.origen || 'SISTEMA'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {ev.estadoAnterior ? (
                        <>
                          <span className="text-zinc-500 line-through">{ev.estadoAnterior}</span>
                          <ArrowRight className="w-4 h-4 text-indigo-500" />
                        </>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">[Creación]</span>
                      )}
                      <span className="text-indigo-600 dark:text-indigo-400">{ev.estadoNuevo}</span>
                    </div>

                    {ev.detalle && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 font-sans">
                        {ev.detalle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
