'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inquilinoService } from '../services/inquilinoService';
import { unidadService } from '../../unidades/services/unidadService';
import type { Inquilino, CreateInquilinoPayload, UpdateInquilinoPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useInquilinos() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInquilino, setSelectedInquilino] = useState<Inquilino | null>(null);

  // Queries
  const { data: unidadesData, isLoading: isLoadingUnidades } = useQuery({
    queryKey: ['unidades', 'all'],
    queryFn: async () => {
      const response = await unidadService.getAll();
      return response.data || [];
    },
  });
  
  const unidades = unidadesData || [];

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['inquilinos', page, limit, debouncedSearch, unidades],
    queryFn: async () => {
      const response = await inquilinoService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching inquilinos');
      
      const enrichedItems = (response.data?.items || []).map((inquilino) => {
        const unidad = unidades.find(u => u.idUnidadHabitacional === inquilino.idUnidadHabitacional);
        return {
          ...inquilino,
          nombreUnidad: unidad ? unidad.identificador : 'Unidad desconocida',
        };
      });

      return { items: enrichedItems, totalCount: response.data?.totalCount || 0 };
    },
    enabled: !!unidadesData, // Fetch only when unidades are available
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateInquilinoPayload) => inquilinoService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['inquilinos'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateInquilinoPayload) => inquilinoService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['inquilinos'] });
        setIsFormOpen(false);
        setSelectedInquilino(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inquilinoService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['inquilinos'] });
        setIsDeleteOpen(false);
        setSelectedInquilino(null);
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
    unidades,
    isLoadingUnidades,
    
    isFormOpen,
    isDeleteOpen,
    selectedInquilino,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedInquilino(null); setIsFormOpen(true); },
    handleOpenEdit: (i: Inquilino) => { setSelectedInquilino(i); setIsFormOpen(true); },
    handleOpenDelete: (i: Inquilino) => { setSelectedInquilino(i); setIsDeleteOpen(true); },
    
    createInquilino: async (payload: CreateInquilinoPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateInquilino: async (payload: UpdateInquilinoPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteInquilino: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
