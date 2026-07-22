'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidenciaService } from '../services/incidenciaService';
import { amenityService } from '../../amenities/services/amenityService';
import { unidadService } from '../../unidades/services/unidadService';
import type { Incidencia, CreateIncidenciaPayload, UpdateIncidenciaPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';
import { useConsorcioActivo } from '@/components/providers';

export function useIncidencias() {
  const queryClient = useQueryClient();
  const { complejoActivo } = useConsorcioActivo();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedIncidencia, setSelectedIncidencia] = useState<Incidencia | null>(null);

  // Queries
  const { data: amenitiesData, isLoading: isLoadingAmenities } = useQuery({
    queryKey: ['amenities', 'all'],
    queryFn: async () => {
      const response = await amenityService.getAll();
      return response.data || [];
    },
  });

  const { data: unidadesData, isLoading: isLoadingUnidades } = useQuery({
    queryKey: ['unidades', 'all'],
    queryFn: async () => {
      const response = await unidadService.getAll();
      return response.data || [];
    },
  });
  
  const amenities = amenitiesData || [];
  const unidades = unidadesData || [];

  // IDs de amenities del complejo activo (para filtrar incidencias)
  const amenityIdsFiltrados = complejoActivo
    ? new Set(amenities.filter(a => a.idComplejo === complejoActivo.id).map(a => a.idAmenity))
    : null;

  // Listas filtradas para el formulario de creación
  const amenitiesFiltrados = complejoActivo
    ? amenities.filter(a => a.idComplejo === complejoActivo.id)
    : amenities;
  const unidadesFiltradas = complejoActivo
    ? unidades.filter(u => u.idComplejo === complejoActivo.id)
    : unidades;

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['incidencias', page, limit, debouncedSearch, complejoActivo?.id, amenities, unidades],
    queryFn: async () => {
      const response = await incidenciaService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching');
      
      const enrichedItems = (response.data?.items || []).map((incidencia) => {
        const amenity = amenities.find(a => a.idAmenity === incidencia.idAmenity);
        const unidad = unidades.find(u => u.idUnidadHabitacional === incidencia.idUnidadHabitacional);
        return {
          ...incidencia,
          nombreAmenity: amenity ? amenity.nombre : 'Amenity desconocido',
          nombreUnidad: unidad ? unidad.identificador : 'Unidad desconocida',
        };
      });

      // Filtrar por complejo activo: incidencias cuyo amenity pertenece al complejo
      const filteredItems = amenityIdsFiltrados
        ? enrichedItems.filter(i => i.idAmenity == null || amenityIdsFiltrados.has(i.idAmenity))
        : enrichedItems;

      return { items: filteredItems, totalCount: filteredItems.length };
    },
    enabled: !!amenitiesData && !!unidadesData,
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateIncidenciaPayload) => incidenciaService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['incidencias'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateIncidenciaPayload) => incidenciaService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['incidencias'] });
        setIsFormOpen(false);
        setSelectedIncidencia(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => incidenciaService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['incidencias'] });
        setIsDeleteOpen(false);
        setSelectedIncidencia(null);
        if (items.length === 1 && page > 1) setPage(p => p - 1);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const isSubmitLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return {
    items,
    totalCount,
    isLoading,
    isSubmitLoading,
    error,
    page,
    limit,
    searchQuery,
    setPage,
    setLimit,
    setSearchQuery,
    
    // Listas filtradas para el formulario
    amenities: amenitiesFiltrados,
    unidades: unidadesFiltradas,
    complejoActivo,
    isLoadingDependencies: isLoadingAmenities || isLoadingUnidades,
    
    isFormOpen,
    isDeleteOpen,
    selectedIncidencia,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedIncidencia(null); setIsFormOpen(true); },
    handleOpenEdit: (i: Incidencia) => { setSelectedIncidencia(i); setIsFormOpen(true); },
    handleOpenDelete: (i: Incidencia) => { setSelectedIncidencia(i); setIsDeleteOpen(true); },
    
    createIncidencia: async (payload: CreateIncidenciaPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateIncidencia: async (payload: UpdateIncidenciaPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteIncidencia: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
