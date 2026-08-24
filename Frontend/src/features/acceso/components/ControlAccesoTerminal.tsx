'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  UserCheck,
  LogOut,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Building,
  Clock,
  User
} from 'lucide-react';
import { accesoService } from '../services/accesoService';
import type { AccesoResultadoDto } from '@/types';

export const ControlAccesoTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invitados' | 'checkin'>('invitados');

  // Estado pestaña Invitados
  const [dniInput, setDniInput] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [resultado, setResultado] = useState<AccesoResultadoDto | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Estado pestaña Check-in Reserva
  const [idReservaInput, setIdReservaInput] = useState<string>('');
  const [isCheckInSubmitting, setIsCheckInSubmitting] = useState<boolean>(false);
  const [checkInMsg, setCheckInMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleBuscarDni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dniInput.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setResultado(null);
    setActionSuccess(null);

    try {
      const res = await accesoService.consultarDni(dniInput.trim());
      if (res.success && res.data) {
        setResultado(res.data);
      } else {
        setSearchError(res.errorMessage || 'No se pudo consultar el DNI.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error de conexión.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegistrarIngreso = async () => {
    if (!resultado?.idInvitado) return;
    try {
      const res = await accesoService.registrarIngreso(resultado.idInvitado);
      if (res.success) {
        setActionSuccess('¡Ingreso registrado correctamente en el sistema!');
      } else {
        setSearchError(res.errorMessage || 'Error al registrar el ingreso.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error al procesar.');
    }
  };

  const handleRegistrarEgreso = async () => {
    if (!resultado?.idInvitado) return;
    try {
      const res = await accesoService.registrarEgreso(resultado.idInvitado);
      if (res.success) {
        setActionSuccess('¡Egreso registrado correctamente!');
      } else {
        setSearchError(res.errorMessage || 'Error al registrar el egreso.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error al procesar.');
    }
  };

  const handleCheckInReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(idReservaInput.trim(), 10);
    if (isNaN(id)) return;

    setIsCheckInSubmitting(true);
    setCheckInMsg(null);

    try {
      const res = await accesoService.registrarCheckInReserva(id);
      if (res.success) {
        setCheckInMsg({
          success: true,
          text: `Check-in confirmado para la Reserva #${id}. ¡Asistencia registrada!`,
        });
        setIdReservaInput('');
      } else {
        setCheckInMsg({
          success: false,
          text: res.errorMessage || 'No se pudo realizar el check-in.',
        });
      }
    } catch (err: any) {
      setCheckInMsg({
        success: false,
        text: err.message || 'Error al conectar con la API de reservas.',
      });
    } finally {
      setIsCheckInSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Terminal */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-1">
                Modulo Portería (CU-03)
              </span>
              <h1 className="text-2xl font-bold">Terminal de Control de Acceso</h1>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-white/20">
          <button
            onClick={() => setActiveTab('invitados')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'invitados'
                ? 'bg-white text-orange-700 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Consulta de Invitados (DNI)
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'checkin'
                ? 'bg-white text-orange-700 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Check-in Amenity (CU-01)
          </button>
        </div>
      </div>

      {/* Pestaña 1: Invitados */}
      {activeTab === 'invitados' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Validar Documento de Visitante
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Ingrese el DNI del visitante para verificar si tiene una autorización de acceso activa.
            </p>

            <form onSubmit={handleBuscarDni} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Ingrese N° de DNI sin puntos (ej. 38445123)"
                  value={dniInput}
                  onChange={(e) => setDniInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-zinc-100 text-base"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-md flex items-center gap-2"
              >
                {isSearching ? 'Consultando...' : 'Consultar DNI'}
              </button>
            </form>
          </div>

          {/* Error de Búsqueda */}
          {searchError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {searchError}
            </div>
          )}

          {/* Éxito de Acción */}
          {actionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              {actionSuccess}
            </div>
          )}

          {/* Tarjeta de Resultado */}
          {resultado && (
            <div
              className={`p-6 rounded-2xl border shadow-lg transition-all ${
                resultado.autorizado
                  ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10'
                  : 'bg-rose-500/5 border-rose-500/30 dark:bg-rose-500/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {resultado.autorizado ? (
                    <div className="p-3 bg-emerald-500 text-white rounded-2xl">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-500 text-white rounded-2xl">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-1 ${
                        resultado.autorizado
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {resultado.autorizado ? 'ACCESO AUTORIZADO' : 'ACCESO DENEGADO'}
                    </span>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      DNI: {dniInput}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resultado.autorizado && resultado.unidadAnfitriona && (
                  <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 font-semibold">
                    <Building className="w-5 h-5 text-indigo-500" />
                    Unidad Anfitriona: <span className="text-indigo-600 dark:text-indigo-400">{resultado.unidadAnfitriona}</span>
                  </div>
                )}

                {!resultado.autorizado && resultado.motivo && (
                  <div className="col-span-2 text-sm text-rose-600 dark:text-rose-400 font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    <strong>Motivo de Rechazo:</strong> {resultado.motivo}
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              {resultado.autorizado && resultado.idInvitado && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={handleRegistrarIngreso}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Registrar Ingreso Efectivo
                  </button>
                  <button
                    onClick={handleRegistrarEgreso}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Registrar Egreso (RN-29)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pestaña 2: Check-in de Reservas */}
      {activeTab === 'checkin' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Confirmación de Asistencia a Amenity (Check-in)
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Registre la presencia del residente o sus invitados al ingresar al espacio para evitar la marca automática de <code>NoAsistio</code> (contingencia #1).
          </p>

          <form onSubmit={handleCheckInReserva} className="flex gap-3 pt-2">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Ingrese el N° ID de Reserva (ej. 104)"
                value={idReservaInput}
                onChange={(e) => setIdReservaInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <button
              type="submit"
              disabled={isCheckInSubmitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCheckInSubmitting ? 'Confirmando...' : 'Confirmar Check-In'}
            </button>
          </form>

          {checkInMsg && (
            <div
              className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
                checkInMsg.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
            >
              {checkInMsg.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              {checkInMsg.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
