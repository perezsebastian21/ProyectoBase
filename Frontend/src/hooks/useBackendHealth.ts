'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { healthService, HealthResponse } from '@/services/healthService';
import { ApiError } from '@/lib/api-client';

export type HealthStatusType = 'idle' | 'loading' | 'alive' | 'error';

export interface UseBackendHealthReturn {
  status: HealthStatusType;
  latency: number | null;
  lastChecked: Date | null;
  errorMessage: string | null;
  data: HealthResponse | null;
  checkHealthStatus: () => Promise<void>;
}

/**
 * Hook personalizado para manejar el estado de salud y conectividad con el backend.
 * 
 * Mide la latencia de la petición y provee funciones para refrescar el estado.
 */
export function useBackendHealth(): UseBackendHealthReturn {
  const [status, setStatus] = useState<HealthStatusType>('idle');
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<HealthResponse | null>(null);
  
  // Usar una ref para evitar llamadas redundantes si ya está cargando
  const isExecutingRef = useRef(false);

  const checkHealthStatus = useCallback(async () => {
    if (isExecutingRef.current) return;
    
    isExecutingRef.current = true;
    setStatus('loading');
    setErrorMessage(null);

    const startTime = performance.now();

    try {
      const responseData = await healthService.checkHealth();
      const endTime = performance.now();
      
      setLatency(Math.round(endTime - startTime));
      setData(responseData);
      setStatus('alive');
      setLastChecked(new Date());
    } catch (error) {
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setData(null);
      setStatus('error');
      setLastChecked(new Date());

      if (error instanceof ApiError) {
        setErrorMessage(`${error.statusText} (${error.status}): ${error.message}`);
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Error desconocido al conectar con el backend');
      }
    } finally {
      isExecutingRef.current = false;
    }
  }, []);

  // Consultar automáticamente la salud al montar el componente
  useEffect(() => {
    const timer = setTimeout(() => {
      checkHealthStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkHealthStatus]);

  return {
    status,
    latency,
    lastChecked,
    errorMessage,
    data,
    checkHealthStatus,
  };
}
