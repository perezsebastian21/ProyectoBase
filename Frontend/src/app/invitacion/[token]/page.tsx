"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Home,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  CreditCard,
} from 'lucide-react';
import { invitacionService } from '@/features/invitaciones/services/invitacionService';
import type { InvitacionValidadaDto, AceptarInvitacionDto } from '@/features/invitaciones/types';

export default function InvitacionOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [validatingError, setValidatingError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<InvitacionValidadaDto | null>(null);

  // Form State
  const [mode, setMode] = useState<'NUEVO' | 'EXISTENTE'>('NUEVO');
  const [idUnidadSeleccionada, setIdUnidadSeleccionada] = useState<number>(0);
  const [esOcupanteActual, setEsOcupanteActual] = useState<boolean>(true);

  // Form Fields
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [dni, setDni] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [usuario, setUsuario] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Execution state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    estadoRelacion: string;
    mensaje: string;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    async function loadTokenData() {
      setLoading(true);
      try {
        const res = await invitacionService.validarToken(token);
        if (res.success && res.data) {
          setInvitationData(res.data);
          setEmail(res.data.emailDestino || '');
          if (res.data.idUnidadHabitacional) {
            setIdUnidadSeleccionada(res.data.idUnidadHabitacional);
          } else if (res.data.unidadesDisponibles && res.data.unidadesDisponibles.length > 0) {
            setIdUnidadSeleccionada(res.data.unidadesDisponibles[0].idUnidadHabitacional);
          }
        } else {
          setValidatingError(res.errorMessage || 'El enlace de invitación es inválido o ha expirado.');
        }
      } catch (err: any) {
        setValidatingError('Ocurrió un error al validar el enlace de invitación.');
      } finally {
        setLoading(false);
      }
    }
    loadTokenData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !invitationData) return;

    if (!idUnidadSeleccionada) {
      setSubmitError('Por favor selecciona tu unidad habitacional.');
      return;
    }

    if (mode === 'NUEVO') {
      if (!nombre.trim() || !apellido.trim() || !dni.trim() || !password.trim()) {
        setSubmitError('Por favor completa todos los campos requeridos (*).');
        return;
      }
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const dto: AceptarInvitacionDto = {
      token,
      esNuevoUsuario: mode === 'NUEVO',
      usuario: mode === 'NUEVO' ? (usuario.trim() || email.trim()) : usuario.trim(),
      nombre: mode === 'NUEVO' ? nombre.trim() : undefined,
      apellido: mode === 'NUEVO' ? apellido.trim() : undefined,
      dni: mode === 'NUEVO' ? dni.trim() : undefined,
      telefono: mode === 'NUEVO' ? telefono.trim() : undefined,
      password: mode === 'NUEVO' ? password : password || undefined,
      idUnidadHabitacional: idUnidadSeleccionada,
      esOcupanteActual,
    };

    try {
      const res = await invitacionService.aceptarInvitacion(dto);
      if (res.success && res.data) {
        setResultado(res.data);
      } else {
        setSubmitError(res.errorMessage || 'No se pudo procesar la invitación.');
      }
    } catch (err: any) {
      setSubmitError('Error de red al procesar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Estado de Carga
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <Building2 className="w-6 h-6 text-blue-400 absolute" />
        </div>
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Validando enlace de invitación...
        </p>
      </div>
    );
  }

  // 2. Error de Validación
  if (validatingError || !invitationData || !invitationData.valida) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invitación Inválida</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {validatingError || 'Este token de invitación ya fue utilizado o ha expirado.'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl transition shadow-lg shadow-blue-500/25 active:scale-[0.98]"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // 3. Resultado de Éxito
  if (resultado) {
    const esPendiente = resultado.estadoRelacion === 'PENDIENTE_APROBACION_ADMIN';

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-fade-in">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
            esPendiente
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {esPendiente ? <ShieldCheck className="w-9 h-9" /> : <CheckCircle2 className="w-9 h-9" />}
          </div>

          <span className={`inline-block text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-3 ${
            esPendiente
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {esPendiente ? 'Pendiente de Validación' : 'Acceso Vigente y Activo'}
          </span>

          <h2 className="text-2xl font-bold text-white mb-2">
            {esPendiente ? '¡Solicitud Registrada!' : '¡Bienvenido a tu Consorcio!'}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-6 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            {resultado.mensaje}
          </p>

          <button
            onClick={() => router.push('/login')}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl transition shadow-lg shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Iniciar Sesión en Livity OS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const isPropietario = invitationData.rolDestino === 'PROPIETARIO';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 pb-12">
      {/* Container Principal */}
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">

        {/* Encabezado Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-purple-600/10 border-b border-slate-800 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Invitación de Onboarding</span>
          </div>

          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <Building2 className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {invitationData.nombreConsorcio}
          </h1>

          {invitationData.nombreComplejo && (
            <p className="text-xs text-blue-300 font-medium mt-0.5">
              {invitationData.nombreComplejo}
            </p>
          )}

          <div className="mt-4 inline-flex items-center gap-2 bg-slate-950/60 px-3.5 py-1.5 rounded-full border border-slate-700/60 text-xs font-medium text-slate-300">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Perfil: <strong>{isPropietario ? 'PROPIETARIO' : 'INQUILINO / RESIDENTE'}</strong></span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

          {/* Error Message */}
          {submitError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* 1. Selección / Confirmación de Unidad Habitacional */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-blue-400" />
              <span>Unidad Habitacional *</span>
            </label>

            {invitationData.unidadesDisponibles && invitationData.unidadesDisponibles.length > 1 ? (
              <select
                value={idUnidadSeleccionada}
                onChange={(e) => setIdUnidadSeleccionada(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              >
                {invitationData.unidadesDisponibles.map((u) => (
                  <option key={u.idUnidadHabitacional} value={u.idUnidadHabitacional}>
                    {u.identificador} {u.torreBloque ? `(${u.torreBloque})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-semibold flex items-center justify-between">
                <span>{invitationData.identificadorUnidad || 'Unidad Pre-Asignada'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}
          </div>

          {/* 2. Declaración de Ocupación */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Declaración de Uso / Ocupación
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEsOcupanteActual(true)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 ${
                  esOcupanteActual
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Home className={`w-5 h-5 mb-2 ${esOcupanteActual ? 'text-blue-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Habito la propiedad</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ocupante actual</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEsOcupanteActual(false)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 ${
                  !esOcupanteActual
                    ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Key className={`w-5 h-5 mb-2 ${!esOcupanteActual ? 'text-purple-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Alquilo / Ausente</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Supervisión sin uso</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Selección de Modo: Nuevo vs Existente */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('NUEVO')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'NUEVO'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Crear Cuenta Nueva
            </button>
            <button
              type="button"
              onClick={() => setMode('EXISTENTE')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'EXISTENTE'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ya tengo Cuenta
            </button>
          </div>

          {/* 4. Campos según Modo */}
          {mode === 'NUEVO' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Juan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Pérez"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">DNI / Pasaporte *</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      placeholder="35.123.456"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+54 11..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email Destino</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Contraseña *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre de Usuario / Email *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="tu_usuario"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Contraseña *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando Registro...</span>
              </>
            ) : (
              <>
                <span>Completar Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
