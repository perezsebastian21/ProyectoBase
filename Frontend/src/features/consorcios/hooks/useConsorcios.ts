'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consorcioService } from '../services/consorcioService';
import type { Consorcio, CreateConsorcioPayload, UpdateConsorcioPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useConsorcios() {
  const queryClient = useQueryClient();
  
  // Parámetros de búsqueda y paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedConsorcio, setSelectedConsorcio] = useState<Consorcio | null>(null);

  // Queries
  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['consorcios', page, limit, debouncedSearch],
    queryFn: async () => {
      const response = await consorcioService.findQP(page, limit, debouncedSearch);
      if (!response.success) {
        throw new Error(response.errorMessage || 'Error al obtener la lista de consorcios');
      }
      return response.data;
    },
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateConsorcioPayload) => consorcioService.create(payload),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['consorcios'] });
        setIsFormOpen(false);
      } else {
        throw new Error(response.errorMessage || 'Error al crear consorcio');
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateConsorcioPayload) => consorcioService.update(payload),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['consorcios'] });
        setIsFormOpen(false);
        setSelectedConsorcio(null);
      } else {
        throw new Error(response.errorMessage || 'Error al actualizar consorcio');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => consorcioService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['consorcios'] });
        setIsDeleteOpen(false);
        setSelectedConsorcio(null);
        if (items.length === 1 && page > 1) {
          setPage(prev => prev - 1);
        }
      } else {
        throw new Error(response.errorMessage || 'Error al eliminar consorcio');
      }
    }
  });

  const isSubmitLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Actions
  const handleOpenCreate = () => {
    setSelectedConsorcio(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (consorcio: Consorcio) => {
    setSelectedConsorcio(consorcio);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (consorcio: Consorcio) => {
    setSelectedConsorcio(consorcio);
    setIsDeleteOpen(true);
  };

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
    
    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedConsorcio,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    
    // Mutate proxies returning Promises to keep signature somewhat similar, or handle differently in component
    createConsorcio: async (payload: CreateConsorcioPayload) => {
      try {
        await createMutation.mutateAsync(payload);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    updateConsorcio: async (payload: UpdateConsorcioPayload) => {
      try {
        await updateMutation.mutateAsync(payload);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    deleteConsorcio: async (id: number) => {
      try {
        await deleteMutation.mutateAsync(id);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    refreshList: () => queryClient.invalidateQueries({ queryKey: ['consorcios'] }),
  };
}
