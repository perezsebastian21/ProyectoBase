'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservaService } from '../services/reservaService';
import { amenityService } from '../../amenities/services/amenityService';
import { unidadService } from '../../unidades/services/unidadService';
import type { Reserva, CreateReservaPayload, UpdateReservaPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';
import { useConsorcioActivo } from '@/components/providers';

export function useReservas() {
  const queryClient = useQueryClient();
  const { complejoActivo } = useConsorcioActivo();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

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

  // Filtrar por el complejo activo (en cliente). Si no hay complejo seleccionado, muestra todo.
  const amenitiesFiltrados = complejoActivo
    ? amenities.filter(a => a.idComplejo === complejoActivo.id)
    : amenities;
  const unidadesFiltradas = complejoActivo
    ? unidades.filter(u => u.idComplejo === complejoActivo.id)
    : unidades;

  // IDs de amenities del complejo activo (para filtrar reservas)
  const amenityIdsFiltrados = new Set(amenitiesFiltrados.map(a => a.idAmenity));

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['reservas', page, limit, debouncedSearch, complejoActivo?.id, amenities, unidades],
    queryFn: async () => {
      const response = await reservaService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching reservas');
      
      // Enriquecer con nombres
      const enrichedItems = (response.data?.items || []).map((reserva) => {
        const amenity = amenities.find(a => a.idAmenity === reserva.idAmenity);
        const unidad = unidades.find(u => u.idUnidadHabitacional === reserva.idUnidadHabitacional);
        return {
          ...reserva,
          nombreAmenity: amenity ? amenity.nombre : 'Amenity desconocido',
          nombreUnidad: unidad ? unidad.identificador : 'Unidad desconocida',
        };
      });

      // Filtrar por complejo activo: solo reservas de amenities del complejo seleccionado
      const filteredItems = complejoActivo
        ? enrichedItems.filter(r => amenityIdsFiltrados.has(r.idAmenity))
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
    mutationFn: (payload: CreateReservaPayload) => reservaService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['reservas'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateReservaPayload) => reservaService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['reservas'] });
        setIsFormOpen(false);
        setSelectedReserva(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reservaService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['reservas'] });
        setIsDeleteOpen(false);
        setSelectedReserva(null);
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
    
    // Listas filtradas por complejo activo (para el formulario de nueva reserva)
    amenities: amenitiesFiltrados,
    unidades: unidadesFiltradas,
    complejoActivo,
    isLoadingDependencies: isLoadingAmenities || isLoadingUnidades,
    
    isFormOpen,
    isDeleteOpen,
    selectedReserva,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedReserva(null); setIsFormOpen(true); },
    handleOpenEdit: (r: Reserva) => { setSelectedReserva(r); setIsFormOpen(true); },
    handleOpenDelete: (r: Reserva) => { setSelectedReserva(r); setIsDeleteOpen(true); },
    
    createReserva: async (payload: CreateReservaPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateReserva: async (payload: UpdateReservaPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteReserva: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
