'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personaService } from '../services/personaService';
import type { Persona, CreatePersonaPayload, UpdatePersonaPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function usePersonas() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['personas', page, limit, debouncedSearch],
    queryFn: async () => {
      const response = await personaService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching personas');
      return { items: response.data?.items || [], totalCount: response.data?.totalCount || 0 };
    }
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  const createMutation = useMutation({
    mutationFn: (payload: CreatePersonaPayload) => personaService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['personas'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdatePersonaPayload) => personaService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['personas'] });
        setIsFormOpen(false);
        setSelectedPersona(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => personaService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['personas'] });
        setIsDeleteOpen(false);
        setSelectedPersona(null);
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
    
    isFormOpen,
    isDeleteOpen,
    selectedPersona,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedPersona(null); setIsFormOpen(true); },
    handleOpenEdit: (p: Persona) => { setSelectedPersona(p); setIsFormOpen(true); },
    handleOpenDelete: (p: Persona) => { setSelectedPersona(p); setIsDeleteOpen(true); },
    
    createPersona: async (payload: CreatePersonaPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updatePersona: async (payload: UpdatePersonaPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deletePersona: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
