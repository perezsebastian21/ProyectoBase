'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ConsorcioActivo {
  id: number;
  nombre: string;
}

export interface ComplejoActivo {
  id: number;
  nombre: string;
}

interface ConsorcioContextValue {
  consorcioActivo: ConsorcioActivo | null;
  complejoActivo: ComplejoActivo | null;
  setConsorcioActivo: (c: ConsorcioActivo | null) => void;
  setComplejoActivo: (c: ComplejoActivo | null) => void;
  clearPerfil: () => void;
}

// ─── Keys de LocalStorage ─────────────────────────────────────────────────────

const STORAGE_CONSORCIO = 'perfil_consorcio_activo';
const STORAGE_COMPLEJO  = 'perfil_complejo_activo';

// ─── Context ──────────────────────────────────────────────────────────────────

const ConsorcioContext = createContext<ConsorcioContextValue>({
  consorcioActivo: null,
  complejoActivo: null,
  setConsorcioActivo: () => {},
  setComplejoActivo: () => {},
  clearPerfil: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ConsorcioProvider({ children }: { children: React.ReactNode }) {
  const [consorcioActivo, setConsorcioActivoState] = useState<ConsorcioActivo | null>(null);
  const [complejoActivo,  setComplejoActivoState]  = useState<ComplejoActivo | null>(null);

  // Hidratar desde localStorage al montar (solo en cliente)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedConsorcio = localStorage.getItem(STORAGE_CONSORCIO);
      const storedComplejo  = localStorage.getItem(STORAGE_COMPLEJO);
      if (storedConsorcio) setConsorcioActivoState(JSON.parse(storedConsorcio));
      if (storedComplejo)  setComplejoActivoState(JSON.parse(storedComplejo));
    } catch {
      // Si el JSON está corrupto, ignoramos
    }
  }, []);

  const setConsorcioActivo = useCallback((c: ConsorcioActivo | null) => {
    setConsorcioActivoState(c);
    if (typeof window === 'undefined') return;
    if (c) {
      localStorage.setItem(STORAGE_CONSORCIO, JSON.stringify(c));
    } else {
      localStorage.removeItem(STORAGE_CONSORCIO);
    }
  }, []);

  const setComplejoActivo = useCallback((c: ComplejoActivo | null) => {
    setComplejoActivoState(c);
    if (typeof window === 'undefined') return;
    if (c) {
      localStorage.setItem(STORAGE_COMPLEJO, JSON.stringify(c));
    } else {
      localStorage.removeItem(STORAGE_COMPLEJO);
    }
  }, []);

  const clearPerfil = useCallback(() => {
    setConsorcioActivoState(null);
    setComplejoActivoState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_CONSORCIO);
      localStorage.removeItem(STORAGE_COMPLEJO);
    }
  }, []);

  return (
    <ConsorcioContext.Provider
      value={{ consorcioActivo, complejoActivo, setConsorcioActivo, setComplejoActivo, clearPerfil }}
    >
      {children}
    </ConsorcioContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para acceder al consorcio y complejo activos desde cualquier componente.
 *
 * @example
 * const { consorcioActivo, complejoActivo, setComplejoActivo } = useConsorcioActivo();
 */
export function useConsorcioActivo() {
  return useContext(ConsorcioContext);
}
