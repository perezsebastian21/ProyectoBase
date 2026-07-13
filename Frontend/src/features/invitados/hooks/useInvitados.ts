'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitadoService } from '../services/invitadoService';
import { unidadService } from '../../unidades/services/unidadService';
import type { Invitado, CreateInvitadoPayload, UpdateInvitadoPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useInvitados() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInvitado, setSelectedInvitado] = useState<Invitado | null>(null);

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
    queryKey: ['invitados', page, limit, debouncedSearch, unidades],
    queryFn: async () => {
      const response = await invitadoService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching invitados');
      
      const enrichedItems = (response.data?.items || []).map((invitado) => {
        const unidad = unidades.find(u => u.idUnidadHabitacional === invitado.idUnidadHabitacional);
        return {
          ...invitado,
          nombreUnidad: unidad ? unidad.identificador : 'Unidad desconocida',
        };
      });

      return { items: enrichedItems, totalCount: response.data?.totalCount || 0 };
    },
    enabled: !!unidadesData,
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateInvitadoPayload) => invitadoService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['invitados'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateInvitadoPayload) => invitadoService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['invitados'] });
        setIsFormOpen(false);
        setSelectedInvitado(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => invitadoService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['invitados'] });
        setIsDeleteOpen(false);
        setSelectedInvitado(null);
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
    selectedInvitado,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedInvitado(null); setIsFormOpen(true); },
    handleOpenEdit: (i: Invitado) => { setSelectedInvitado(i); setIsFormOpen(true); },
    handleOpenDelete: (i: Invitado) => { setSelectedInvitado(i); setIsDeleteOpen(true); },
    
    createInvitado: async (payload: CreateInvitadoPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateInvitado: async (payload: UpdateInvitadoPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteInvitado: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
