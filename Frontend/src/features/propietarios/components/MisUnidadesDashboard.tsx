'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Home, CheckCircle2, AlertTriangle, Clock, ShieldCheck, Users, Info } from 'lucide-react';
import { propietarioService, UnidadPropietarioResumen } from '../services/propietarioService';

export const MisUnidadesDashboard: React.FC = () => {
  const [data, setData] = useState<UnidadPropietarioResumen[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const cargarUnidades = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await propietarioService.getMisUnidades();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setErrorMsg(res.errorMessage || 'No se pudieron cargar tus unidades vinculadas.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarUnidades();
  }, []);

  const handleAprobar = async (idReserva: number) => {
    try {
      const res = await propietarioService.aprobarReservaInquilino(idReserva);
      if (res.success) {
        setActionMsg(`Reserva #${idReserva} aprobada exitosamente por el propietario.`);
        cargarUnidades();
      } else {
        setErrorMsg(res.errorMessage || 'Error al aprobar la reserva.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la aprobación.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-1">
              Perfil Propietario (BR-AUTH-010)
            </span>
            <h1 className="text-2xl font-bold">Supervisión Multi-Unidad</h1>
          </div>
        </div>
        <p className="text-sm text-teal-100 mt-2 max-w-2xl">
          Supervise la actividad, expensas, reservas e incidencias de todas las propiedades vinculadas a su cuenta.
        </p>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {actionMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {isLoading && (
        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 text-sm flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 animate-spin text-teal-500" />
          Cargando propiedades e inquilinos...
        </div>
      )}

      {!isLoading && data.length === 0 && !errorMsg && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 dark:text-zinc-400">
          <Home className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
          <p className="font-semibold text-base">No hay unidades registradas bajo este perfil de propietario.</p>
        </div>
      )}

      {!isLoading && data.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Info Unidad */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Unidad {item.unidad.identificador}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.unidad.complejo?.nombre || 'Complejo Principal'}
                    </p>
                  </div>
                </div>

                {/* Badges de Estado */}
                <div className="flex flex-wrap gap-2">
                  {item.unidad.debeExpensas ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      Deuda Expensas: ${item.unidad.saldoActual}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Expensas al día
                    </span>
                  )}

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Infracciones: {item.unidad.contadorInfracciones}
                  </span>
                </div>
              </div>

              {/* Reservas Activas de Inquilinos */}
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Reservas Activas de Inquilinos
                </h4>

                {item.reservasActivas.length === 0 ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                    Sin reservas activas en esta propiedad.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {item.reservasActivas.map((r) => (
                      <div
                        key={r.idReserva}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            Reserva #{r.idReserva} - {r.amenity?.nombre || `Amenity #${r.idAmenity}`}
                          </span>
                          <div className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Fecha: {r.fechaUso} | Horario: {r.horaInicio.slice(0, 5)} - {r.horaFin.slice(0, 5)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            {r.estado}
                          </span>

                          {/* Botón Aprobación del Propietario */}
                          {r.estado === 'PendienteAprobacionPropietario' && (
                            <button
                              onClick={() => handleAprobar(r.idReserva)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Aprobar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
