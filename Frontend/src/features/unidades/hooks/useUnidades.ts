'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unidadService } from '../services/unidadService';
import { complejoService } from '../../complejos/services/complejoService';
import type { UnidadHabitacional, CreateUnidadPayload, UpdateUnidadPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useUnidades() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState<UnidadHabitacional | null>(null);

  // Queries
  const { data: complejosData, isLoading: isLoadingComplejos } = useQuery({
    queryKey: ['complejos', 'all'],
    queryFn: async () => {
      const response = await complejoService.getAll();
      return response.data || [];
    },
  });
  
  const complejos = complejosData || [];

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['unidades', page, limit, debouncedSearch, complejos],
    queryFn: async () => {
      const response = await unidadService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching unidades');
      
      const enrichedItems = (response.data?.items || []).map((unidad) => {
        const complejo = complejos.find(c => c.idComplejo === unidad.idComplejo);
        return {
          ...unidad,
          nombreComplejo: complejo ? complejo.nombre : 'Complejo desconocido',
        };
      });

      return { items: enrichedItems, totalCount: response.data?.totalCount || 0 };
    },
    enabled: !!complejosData, // Only fetch when complejos are ready
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateUnidadPayload) => unidadService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['unidades'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUnidadPayload) => unidadService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['unidades'] });
        setIsFormOpen(false);
        setSelectedUnidad(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unidadService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['unidades'] });
        setIsDeleteOpen(false);
        setSelectedUnidad(null);
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
    complejos,
    isLoadingComplejos,
    
    isFormOpen,
    isDeleteOpen,
    selectedUnidad,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedUnidad(null); setIsFormOpen(true); },
    handleOpenEdit: (u: UnidadHabitacional) => { setSelectedUnidad(u); setIsFormOpen(true); },
    handleOpenDelete: (u: UnidadHabitacional) => { setSelectedUnidad(u); setIsDeleteOpen(true); },
    
    createUnidad: async (payload: CreateUnidadPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateUnidad: async (payload: UpdateUnidadPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteUnidad: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
