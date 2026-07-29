'use client';

import React, { useState } from 'react';
import {
  Building2,
  Home,
  DoorClosed,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import type {
  OnboardingRequestDto,
  ConsorcioDto,
  ComplejoDto,
  UnidadDto,
  AmenityCreacionDto,
  AmenityConfigDto
} from '../types';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEFAULT_CONFIG: AmenityConfigDto = {
  horarioInicio: '08:00',
  horarioFin: '22:00',
  duracionBloqueMinutos: 60,
  tiempoLimpiezaMinutos: 15,
  tarifa: 0,
  limiteReservasMesUnidad: 4,
  requiereAprobacion: false,
};

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  // Paso 1: Consorcio
  const [consorcio, setConsorcio] = useState<ConsorcioDto>({
    cuit: '',
    nombre: '',
    email: '',
    telefono: '',
    timeZoneId: 'America/Argentina/Buenos_Aires',
  });

  // Paso 2: Complejo
  const [complejo, setComplejo] = useState<ComplejoDto>({
    nombre: '',
    tipo: 'EDIFICIO',
    direccion: '',
  });

  // Paso 3: Unidades
  const [unidades, setUnidades] = useState<UnidadDto[]>([
    { identificador: '1A', emailResidente: 'residente1a@ejemplo.com' },
    { identificador: '1B', emailResidente: 'residente1b@ejemplo.com' },
  ]);
  const [nuevoIdentificador, setNuevoIdentificador] = useState<string>('');
  const [nuevoEmailResidente, setNuevoEmailResidente] = useState<string>('');

  // Paso 4: Amenities
  const [amenities, setAmenities] = useState<AmenityCreacionDto[]>([
    {
      nombre: 'Piscina Principal',
      capacidad: 25,
      config: { ...DEFAULT_CONFIG, horarioInicio: '09:00', horarioFin: '21:00' },
    },
    {
      nombre: 'SUM / Salón de Eventos',
      capacidad: 50,
      config: { ...DEFAULT_CONFIG, tarifa: 15000, requiereAprobacion: true },
    },
  ]);
  const [nuevoAmenityNombre, setNuevoAmenityNombre] = useState<string>('');
  const [nuevoAmenityCapacidad, setNuevoAmenityCapacidad] = useState<number>(10);
  const [nuevoAmenityConfig, setNuevoAmenityConfig] = useState<AmenityConfigDto>(DEFAULT_CONFIG);

  if (!isOpen) return null;

  // Agregar Unidad a la lista
  const handleAddUnidad = () => {
    if (!nuevoIdentificador.trim()) return;
    setUnidades((prev) => [
      ...prev,
      { identificador: nuevoIdentificador.trim(), emailResidente: nuevoEmailResidente.trim() || undefined },
    ]);
    setNuevoIdentificador('');
    setNuevoEmailResidente('');
  };

  const handleRemoveUnidad = (index: number) => {
    setUnidades((prev) => prev.filter((_, i) => i !== index));
  };

  // Agregar Amenity a la lista
  const handleAddAmenity = () => {
    if (!nuevoAmenityNombre.trim()) return;
    setAmenities((prev) => [
      ...prev,
      {
        nombre: nuevoAmenityNombre.trim(),
        capacidad: Math.max(1, nuevoAmenityCapacidad),
        config: { ...nuevoAmenityConfig },
      },
    ]);
    setNuevoAmenityNombre('');
    setNuevoAmenityCapacidad(10);
    setNuevoAmenityConfig(DEFAULT_CONFIG);
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities((prev) => prev.filter((_, i) => i !== index));
  };

  // Validaciones antes de avanzar
  const validateStep = (currentStep: number): boolean => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!consorcio.cuit || consorcio.cuit.length < 10) {
        setErrorMsg('El CUIT del consorcio es obligatorio (11 dígitos).');
        return false;
      }
      if (!consorcio.nombre.trim()) {
        setErrorMsg('El nombre del consorcio es obligatorio.');
        return false;
      }
      if (!consorcio.email.trim() || !consorcio.email.includes('@')) {
        setErrorMsg('Ingrese un email de contacto válido para el consorcio.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!complejo.nombre.trim()) {
        setErrorMsg('El nombre del complejo o edificio es obligatorio.');
        return false;
      }
      if (!complejo.direccion.trim()) {
        setErrorMsg('La dirección es obligatoria.');
        return false;
      }
    } else if (currentStep === 3) {
      if (unidades.length === 0) {
        setErrorMsg('Debe registrar al menos una unidad habitacional para realizar el onboarding.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitOnboarding = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: OnboardingRequestDto = {
      consorcio,
      complejo,
      unidades,
      amenities,
    };

    try {
      const res = await onboardingService.executeOnboarding(payload);
      if (res.success) {
        setSuccessStatus('ONBOARDING_COMPLETE');
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.errorMessage || 'Ocurrió un error al procesar el onboarding.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión al servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                Onboarding Consorcio (CU-08)
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Alta unificada multientidad en una sola transacción
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        {!successStatus && (
          <div className="grid grid-cols-4 gap-2 my-4">
            {[
              { id: 1, label: 'Consorcio', icon: Building2 },
              { id: 2, label: 'Complejo', icon: Home },
              { id: 3, label: 'Unidades', icon: DoorClosed },
              { id: 4, label: 'Amenities', icon: Sparkles },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;

              return (
                <div
                  key={s.id}
                  className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    isActive
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400 font-bold'
                      : isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1 text-xs">
                    {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    <span>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feedback de Error */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body Contenido por Paso */}
        <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-4">
          {successStatus ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                ¡Onboarding Completado Exitosamente!
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                El Consorcio <strong>{consorcio.nombre}</strong>, su Complejo <strong>{complejo.nombre}</strong>, las {unidades.length} unidades y {amenities.length} amenities han sido creados correctamente en la base de datos.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="mt-4 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
              >
                Finalizar y Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* PASO 1: CONSORCIO */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    Información Legal del Consorcio (ENT-01)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        CUIT (11 dígitos sin guiones) *
                      </label>
                      <input
                        type="text"
                        placeholder="30712345678"
                        maxLength={11}
                        value={consorcio.cuit}
                        onChange={(e) => setConsorcio({ ...consorcio, cuit: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Nombre del Consorcio *
                      </label>
                      <input
                        type="text"
                        placeholder="Consorcio Edificio Bellini"
                        value={consorcio.nombre}
                        onChange={(e) => setConsorcio({ ...consorcio, nombre: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Email Principal de Contacto *
                      </label>
                      <input
                        type="email"
                        placeholder="administracion@bellini.com"
                        value={consorcio.email}
                        onChange={(e) => setConsorcio({ ...consorcio, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Teléfono de Administración
                      </label>
                      <input
                        type="text"
                        placeholder="+54 11 4455-6677"
                        value={consorcio.telefono}
                        onChange={(e) => setConsorcio({ ...consorcio, telefono: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: COMPLEJO */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    Datos del Complejo / Edificio (ENT-02)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Nombre del Complejo *
                      </label>
                      <input
                        type="text"
                        placeholder="Torre 1 - Bellini Plaza"
                        value={complejo.nombre}
                        onChange={(e) => setComplejo({ ...complejo, nombre: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Tipo de Complejo *
                        </label>
                        <select
                          value={complejo.tipo}
                          onChange={(e) => setComplejo({ ...complejo, tipo: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium cursor-pointer"
                        >
                          <option value="EDIFICIO">Edificio Residencial</option>
                          <option value="BARRIO_PRIVADO">Barrio Privado / Barrio Cerrado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Dirección Física *
                        </label>
                        <input
                          type="text"
                          placeholder="Av. Santa Fe 1234, CABA"
                          value={complejo.direccion}
                          onChange={(e) => setComplejo({ ...complejo, direccion: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: UNIDADES */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      Unidades Habitacionales (ENT-03)
                    </h3>
                    <span className="text-xs font-extrabold text-indigo-500">
                      {unidades.length} registradas
                    </span>
                  </div>

                  {/* Formulario de Agregado */}
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Agregar Unidad Habitacional
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Identificador (ej. 1A, Lote 42)"
                        value={nuevoIdentificador}
                        onChange={(e) => setNuevoIdentificador(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      />
                      <input
                        type="email"
                        placeholder="Email Residente (Opcional)"
                        value={nuevoEmailResidente}
                        onChange={(e) => setNuevoEmailResidente(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddUnidad}
                      className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Agregar a la Lista
                    </button>
                  </div>

                  {/* Lista de Unidades */}
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {unidades.map((u, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <DoorClosed className="w-4 h-4 text-indigo-500" />
                          <span className="font-bold text-zinc-800 dark:text-zinc-100">
                            Unidad {u.identificador}
                          </span>
                          {u.emailResidente && (
                            <span className="text-zinc-400 text-[11px]">({u.emailResidente})</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveUnidad(idx)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PASO 4: AMENITIES */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      Amenities y Reglas Operativas (ENT-04 & ENT-05)
                    </h3>
                    <span className="text-xs font-extrabold text-purple-500">
                      {amenities.length} amenities
                    </span>
                  </div>

                  {/* Formulario de Agregado Amenity */}
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Agregar Espacio Común / Amenity
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nombre (ej. Quincho, Gimnasio)"
                        value={nuevoAmenityNombre}
                        onChange={(e) => setNuevoAmenityNombre(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Capacidad (Aforo)"
                        min={1}
                        value={nuevoAmenityCapacidad}
                        onChange={(e) => setNuevoAmenityCapacidad(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-zinc-500">Horario Inicio</label>
                        <input
                          type="time"
                          value={nuevoAmenityConfig.horarioInicio}
                          onChange={(e) =>
                            setNuevoAmenityConfig({ ...nuevoAmenityConfig, horarioInicio: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500">Horario Fin</label>
                        <input
                          type="time"
                          value={nuevoAmenityConfig.horarioFin}
                          onChange={(e) =>
                            setNuevoAmenityConfig({ ...nuevoAmenityConfig, horarioFin: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500">Tarifa ($)</label>
                        <input
                          type="number"
                          min={0}
                          value={nuevoAmenityConfig.tarifa}
                          onChange={(e) =>
                            setNuevoAmenityConfig({ ...nuevoAmenityConfig, tarifa: Number(e.target.value) })
                          }
                          className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500">Bloque (Min)</label>
                        <input
                          type="number"
                          min={15}
                          step={15}
                          value={nuevoAmenityConfig.duracionBloqueMinutos}
                          onChange={(e) =>
                            setNuevoAmenityConfig({
                              ...nuevoAmenityConfig,
                              duracionBloqueMinutos: Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAmenity}
                      className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Agregar Amenity
                    </button>
                  </div>

                  {/* Lista de Amenities */}
                  <div className="max-h-44 overflow-y-auto space-y-2">
                    {amenities.map((a, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="font-bold text-zinc-800 dark:text-zinc-100">{a.nombre}</span>
                          <span className="text-zinc-400 text-[11px]">(Cap: {a.capacidad})</span>
                          {a.config.tarifa > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                              ${a.config.tarifa}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(idx)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navegación */}
        {!successStatus && (
          <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitOnboarding}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isSubmitting ? 'Procesando Onboarding...' : 'Confirmar y Finalizar Onboarding'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
