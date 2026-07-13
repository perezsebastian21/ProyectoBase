'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listaEsperaService } from '../services/listaEsperaService';
import { amenityService } from '../../amenities/services/amenityService';
import { unidadService } from '../../unidades/services/unidadService';
import type { ListaEspera, CreateListaEsperaPayload, UpdateListaEsperaPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useListasEspera() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLista, setSelectedLista] = useState<ListaEspera | null>(null);

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

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['listasEspera', page, limit, debouncedSearch, amenities, unidades],
    queryFn: async () => {
      const response = await listaEsperaService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching');
      
      const enrichedItems = (response.data?.items || []).map((lista) => {
        const amenity = amenities.find(a => a.idAmenity === lista.idAmenity);
        const unidad = unidades.find(u => u.idUnidadHabitacional === lista.idUnidadHabitacional);
        return {
          ...lista,
          nombreAmenity: amenity ? amenity.nombre : 'Amenity desconocido',
          nombreUnidad: unidad ? unidad.identificador : 'Unidad desconocida',
        };
      });

      return { items: enrichedItems, totalCount: response.data?.totalCount || 0 };
    },
    enabled: !!amenitiesData && !!unidadesData,
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateListaEsperaPayload) => listaEsperaService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['listasEspera'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateListaEsperaPayload) => listaEsperaService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['listasEspera'] });
        setIsFormOpen(false);
        setSelectedLista(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => listaEsperaService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['listasEspera'] });
        setIsDeleteOpen(false);
        setSelectedLista(null);
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
    
    amenities,
    unidades,
    isLoadingDependencies: isLoadingAmenities || isLoadingUnidades,
    
    isFormOpen,
    isDeleteOpen,
    selectedLista,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedLista(null); setIsFormOpen(true); },
    handleOpenEdit: (l: ListaEspera) => { setSelectedLista(l); setIsFormOpen(true); },
    handleOpenDelete: (l: ListaEspera) => { setSelectedLista(l); setIsDeleteOpen(true); },
    
    createLista: async (payload: CreateListaEsperaPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateLista: async (payload: UpdateListaEsperaPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteLista: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
