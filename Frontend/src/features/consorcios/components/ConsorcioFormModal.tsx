'use client';

import React, { useState, useEffect } from 'react';
import type { Consorcio, CreateConsorcioPayload } from '../types';

interface ConsorcioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  initialData: Consorcio | null;
  isSubmitLoading: boolean;
}

export default function ConsorcioFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitLoading,
}: ConsorcioFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [cuit, setCuit] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setCuit(initialData.cuit);
      setEmail(initialData.email);
      setTelefono(initialData.telefono);
    } else {
      setNombre('');
      setCuit('');
      setEmail('');
      setTelefono('');
    }
    setValidationError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validaciones
    if (!nombre.trim()) {
      setValidationError('El nombre del consorcio es obligatorio.');
      return;
    }
    
    // CUIT: debe tener 11 dígitos y ser numérico
    const cleanCuit = cuit.replace(/\D/g, '');
    if (cleanCuit.length !== 11) {
      setValidationError('El CUIT debe contener exactamente 11 dígitos numéricos.');
      return;
    }

    // Email: formato correcto
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setValidationError('Ingresá un correo electrónico válido.');
      return;
    }

    if (!telefono.trim()) {
      setValidationError('El teléfono de contacto es obligatorio.');
      return;
    }

    const payload: CreateConsorcioPayload = {
      nombre: nombre.trim(),
      cuit: cleanCuit,
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
    };

    if (initialData) {
      const res = await onSubmit({ ...payload, idConsorcio: initialData.idConsorcio });
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
            {initialData ? 'Editar Consorcio' : 'Nuevo Consorcio'}
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

        {/* Form */}
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

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Nombre del Consorcio
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Consorcio Torres del Sol"
              disabled={isSubmitLoading}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface-container/50 dark:bg-slate-950/40 border border-brand-surface-bright/30 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
          </div>

          {/* CUIT */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              CUIT
            </label>
            <input
              type="text"
              required
              maxLength={11}
              value={cuit}
              onChange={(e) => setCuit(e.target.value.replace(/\D/g, ''))}
              placeholder="Ej. 30712345678"
              disabled={isSubmitLoading}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface-container/50 dark:bg-slate-950/40 border border-brand-surface-bright/30 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Email de Contacto
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. contacto@torresdelsol.com"
              disabled={isSubmitLoading}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface-container/50 dark:bg-slate-950/40 border border-brand-surface-bright/30 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Teléfono de Contacto
            </label>
            <input
              type="text"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. +54 11 4321-8765"
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
      </div>
    </div>
  );
}
