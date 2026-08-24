'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Ban,
  DollarSign,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { amenityService } from '../services/amenityService';
import type {
  DisponibilidadResponseDto,
  DisponibilidadSlotDto,
  MotivoNoDisponible
} from '@/types';

interface AmenityDisponibilidadGridProps {
  idAmenity: number;
  nombreAmenity?: string;
  idUnidadHabitacional?: number;
  onReservarSlot?: (slot: DisponibilidadSlotDto, fecha: string) => void;
  onAnotarListaEspera?: (slot: DisponibilidadSlotDto, fecha: string) => void;
}

export const AmenityDisponibilidadGrid: React.FC<AmenityDisponibilidadGridProps> = ({
  idAmenity,
  nombreAmenity,
  idUnidadHabitacional,
  onReservarSlot,
  onAnotarListaEspera,
}) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [data, setData] = useState<DisponibilidadResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cargarDisponibilidad = async (fecha: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await amenityService.getDisponibilidad(
        idAmenity,
        fecha,
        fecha,
        idUnidadHabitacional
      );
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setErrorMsg(res.errorMessage || 'No se pudo obtener la disponibilidad.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (idAmenity) {
      cargarDisponibilidad(fechaSeleccionada);
    }
  }, [idAmenity, fechaSeleccionada, idUnidadHabitacional]);

  const cambiarDia = (offset: number) => {
    const d = new Date(fechaSeleccionada);
    d.setDate(d.getDate() + offset);
    setFechaSeleccionada(d.toISOString().split('T')[0]);
  };

  const getMotivoBadge = (motivo: MotivoNoDisponible) => {
    switch (motivo) {
      case 'OCUPADO':
        return {
          label: 'Ocupado',
          bgColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          icon: XCircle,
        };
      case 'RESERVADO_LISTA_ESPERA':
        return {
          label: 'Retenido Hold',
          bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          icon: Clock,
        };
      case 'MANTENIMIENTO':
        return {
          label: 'Mantenimiento',
          bgColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
          icon: AlertTriangle,
        };
      case 'FUERA_DE_SERVICIO':
        return {
          label: 'Fuera de Servicio',
          bgColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
          icon: Ban,
        };
      case 'FERIADO':
        return {
          label: 'Feriado Cerrado',
          bgColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          icon: ShieldAlert,
        };
      case 'ANTICIPACION_MINIMA_NO_CUMPLIDA':
        return {
          label: 'Anticipación Insuficiente',
          bgColor: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
          icon: Info,
        };
      case 'LIMITE_MENSUAL_ALCANZADO':
        return {
          label: 'Límite Mensual Alcanzado',
          bgColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
          icon: AlertTriangle,
        };
      default:
        return {
          label: 'No Disponible',
          bgColor: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
          icon: Info,
        };
    }
  };

  const diaActualData = data?.dias?.find((d) => d.fecha === fechaSeleccionada);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm">
      {/* Encabezado y Navegación de Fecha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Disponibilidad Horaria
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {nombreAmenity || data?.nombreAmenity || `Amenity #${idAmenity}`}
            {data?.configuracion && (
              <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                • Bloques de {data.configuracion.duracionBloqueMinutos} min
                {data.configuracion.tarifa > 0 && ` | $${data.configuracion.tarifa}`}
              </span>
            )}
          </p>
        </div>

        {/* Picker de fecha */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => cambiarDia(-1)}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Día Anterior"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-100"
          />
          <button
            onClick={() => cambiarDia(1)}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Día Siguiente"
          >
            <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Banner Informativo Cupo Restante */}
      {data?.cupoRestanteUnidadMes !== undefined && data?.cupoRestanteUnidadMes !== null && (
        <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            Cupo de reservas restante para tu unidad este mes: <strong>{data.cupoRestanteUnidadMes}</strong>
          </span>
        </div>
      )}

      {/* Estado del Amenity */}
      {data?.estadoAmenity === 'FUERA_DE_SERVICIO' && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400 font-medium">
          <Ban className="w-5 h-5" />
          <span>Este espacio se encuentra temporalmente fuera de servicio por mantenimiento preventivo o incidencia.</span>
        </div>
      )}

      {/* Carga o Mensaje de Error */}
      {isLoading && (
        <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 animate-spin text-indigo-500" />
          Consultando disponibilidad horaria...
        </div>
      )}

      {errorMsg && !isLoading && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-600 dark:text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Grilla de Slots */}
      {!isLoading && !errorMsg && diaActualData && (
        <div className="mt-6">
          {diaActualData.slots.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No hay bloques horarios configurados para este día.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {diaActualData.slots.map((slot, idx) => {
                const isDisponible = slot.disponible;
                const isOcupado = slot.motivoNoDisponible === 'OCUPADO';
                const isHold = slot.motivoNoDisponible === 'RESERVADO_LISTA_ESPERA';
                const badge = slot.motivoNoDisponible ? getMotivoBadge(slot.motivoNoDisponible) : null;
                const IconComponent = badge?.icon;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isDisponible
                        ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10'
                        : isOcupado
                        ? 'border-rose-500/20 bg-rose-500/5'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        {slot.horaInicio.slice(0, 5)} - {slot.horaFin.slice(0, 5)}
                      </div>
                      {isDisponible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Libre
                        </span>
                      ) : badge ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.bgColor}`}
                        >
                          {IconComponent && <IconComponent className="w-3 h-3" />}
                          {badge.label}
                        </span>
                      ) : null}
                    </div>

                    {/* Acciones */}
                    <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-end">
                      {isDisponible && (
                        <button
                          onClick={() => onReservarSlot && onReservarSlot(slot, fechaSeleccionada)}
                          className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reservar Slot
                        </button>
                      )}

                      {isOcupado && (
                        <button
                          onClick={() => onAnotarListaEspera && onAnotarListaEspera(slot, fechaSeleccionada)}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                          title="Anotarme en Lista de Espera si se libera este turno"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Unirme a Espera
                        </button>
                      )}

                      {!isDisponible && !isOcupado && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 italic">No reservable</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
