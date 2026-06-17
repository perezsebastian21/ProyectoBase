'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import type { Consorcio } from '../../consorcios/types';
import type { Complejo, CreateComplejoPayload } from '../types';

interface ComplejoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Complejo | null;
  consorcios: Consorcio[];
  isLoadingConsorcios: boolean;
  isSubmitLoading: boolean;
}

const TIPOS_COMPLEJO = [
  { value: 'EDIFICIO', label: 'Edificio' },
  { value: 'BARRIO_CERRADO', label: 'Barrio Cerrado' },
  { value: 'OTRO', label: 'Otro' },
];

export default function ComplejoFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  consorcios,
  isLoadingConsorcios,
  isSubmitLoading,
}: ComplejoFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('EDIFICIO');
  const [direccion, setDireccion] = useState('');
  const [idConsorcio, setIdConsorcio] = useState<number | ''>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Cargar datos al abrir modal / editar
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setTipo(initialData.tipo);
      setDireccion(initialData.direccion);
      setIdConsorcio(initialData.idConsorcio);
    } else {
      setNombre('');
      setTipo('EDIFICIO');
      setDireccion('');
      // Autoseleccionar el primer consorcio si existe alguno
      if (consorcios.length > 0) {
        setIdConsorcio(consorcios[0].idConsorcio);
      } else {
        setIdConsorcio('');
      }
    }
    setValidationError(null);
  }, [initialData, isOpen, consorcios]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (consorcios.length === 0) {
      setValidationError('No puedes guardar un complejo sin un consorcio asociado.');
      return;
    }

    if (!nombre.trim()) {
      setValidationError('El nombre del complejo es obligatorio.');
      return;
    }

    if (!direccion.trim()) {
      setValidationError('La dirección es obligatoria.');
      return;
    }

    if (!idConsorcio) {
      setValidationError('Debes asociar el complejo a un consorcio.');
      return;
    }

    const payload: CreateComplejoPayload = {
      nombre: nombre.trim(),
      tipo,
      direccion: direccion.trim(),
      idConsorcio: Number(idConsorcio),
    };

    if (initialData) {
      const res = await onSubmit({ ...payload, idComplejo: initialData.idComplejo });
      if (!res.success && res.error) {
        setValidationError(res.error);
      }
    } else {
      const res = await onSubmit(payload);
      if (!res.success && res.error) {
        setValidationError(res.error);
      }
    }
  };

  const hasNoConsorcios = consorcios.length === 0 && !isLoadingConsorcios;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface dark:bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl animate-fade-in z-10 text-slate-800 dark:text-slate-100">
        
        {/* Glow effect */}
        <div className="absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 blur-3xl" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-surface-bright/10 dark:border-white/5">
          <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {initialData ? 'Editar Complejo' : 'Nuevo Complejo'}
          </h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dynamic Empty State Warning */}
        {hasNoConsorcios ? (
          <div className="mt-6 space-y-6 text-center py-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Se requiere un Consorcio</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                No hay consorcios registrados en el sistema. Debes crear al menos un consorcio para poder asociar un nuevo complejo.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={ROUTES.CONSORCIOS}
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/95 transition-all flex items-center justify-center gap-2"
              >
                <span>Crear Consorcio</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-brand-surface-bright/30 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          /* Form contents */
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Error Message */}
            {validationError && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-shake">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{validationError}</span>
              </div>
            )}

            {/* Consorcio Dropdown Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Consorcio Asociado
              </label>
              <div className="relative">
                {isLoadingConsorcios ? (
                  <div className="w-full px-4 py-3 rounded-xl bg-brand-surface-container/50 dark:bg-slate-950/40 border border-brand-surface-bright/30 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-between">
                    <span>Cargando consorcios...</span>
                    <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : (
                  <select
                    required
                    value={idConsorcio}
                    onChange={(e) => setIdConsorcio(Number(e.target.value))}
                    disabled={isSubmitLoading}
                    className="w-full px-4 py-3 rounded-xl bg-brand-surface-container/50 dark:bg-slate-950/40 border border-brand-surface-bright/30 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-all cursor-pointer appearance-none"
                  >
                    {consorcios.map((c) => (
                      <option 
                        key={c.idConsorcio} 
                        value={c.idConsorcio}
                        className="bg-brand-surface dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      >
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                )}
                {/* Custom arrow for select */}
                {!isLoadingConsorcios && (
                  <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {/* Nombre Complejo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Nombre del Complejo
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Torre Mirador Sur"
                disabled={isSubmitLoading}
                className="w-full px-4 py-3 rounded-xl bg-brand-surface-container/50 dark:bg-slate-950/40 border border-brand-surface-bright/30 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-all"
              />
            </div>

            {/* Tipo Complejo Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Tipo de Complejo
              </label>
              <div className="relative">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  disabled={isSubmitLoading}
                  className="w-full px-4 py-3 rounded-xl bg-brand-surface-container/50 dark:bg-slate-950/40 border border-brand-surface-bright/30 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-all cursor-pointer appearance-none"
                >
                  {TIPOS_COMPLEJO.map((item) => (
                    <option 
                      key={item.value} 
                      value={item.value}
                      className="bg-brand-surface dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Dirección
              </label>
              <input
                type="text"
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej. Av. del Libertador 4567"
                disabled={isSubmitLoading}
                className="w-full px-4 py-3 rounded-xl bg-brand-surface-container/50 dark:bg-slate-950/40 border border-brand-surface-bright/30 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-brand-surface-bright/10 dark:border-white/5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-brand-surface-bright/30 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-white text-sm font-semibold shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:bg-brand-primary/95 hover:shadow-[0_4px_25px_rgba(59,130,246,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
