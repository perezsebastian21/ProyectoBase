'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complejoService } from '../services/complejoService';
import { consorcioService } from '../../consorcios/services/consorcioService';
import type { Complejo, CreateComplejoPayload, UpdateComplejoPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useComplejos() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedComplejo, setSelectedComplejo] = useState<Complejo | null>(null);

  // Queries
  const { data: consorciosData, isLoading: isLoadingConsorcios } = useQuery({
    queryKey: ['consorcios', 'all'],
    queryFn: async () => {
      const response = await consorcioService.getAll();
      return response.data || [];
    },
  });
  
  const consorcios = consorciosData || [];

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['complejos', page, limit, debouncedSearch, consorcios],
    queryFn: async () => {
      const response = await complejoService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching complejos');
      
      const enrichedItems = (response.data?.items || []).map((complejo) => {
        const consorcio = consorcios.find(c => c.idConsorcio === complejo.idConsorcio);
        return {
          ...complejo,
          nombreConsorcio: consorcio ? consorcio.nombre : 'Consorcio desconocido',
        };
      });

      return { items: enrichedItems, totalCount: response.data?.totalCount || 0 };
    },
    enabled: !!consorciosData, // Only fetch when consorcios are ready
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateComplejoPayload) => complejoService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['complejos'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateComplejoPayload) => complejoService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['complejos'] });
        setIsFormOpen(false);
        setSelectedComplejo(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => complejoService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['complejos'] });
        setIsDeleteOpen(false);
        setSelectedComplejo(null);
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
    consorcios,
    isLoadingConsorcios,
    
    isFormOpen,
    isDeleteOpen,
    selectedComplejo,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedComplejo(null); setIsFormOpen(true); },
    handleOpenEdit: (c: Complejo) => { setSelectedComplejo(c); setIsFormOpen(true); },
    handleOpenDelete: (c: Complejo) => { setSelectedComplejo(c); setIsDeleteOpen(true); },
    
    createComplejo: async (payload: CreateComplejoPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateComplejo: async (payload: UpdateComplejoPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteComplejo: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
