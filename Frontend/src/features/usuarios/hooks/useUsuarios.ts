'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '../services/usuarioService';
import type { Usuario, CreateUsuarioPayload, UpdateUsuarioPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useUsuarios() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['usuarios', page, limit, debouncedSearch],
    queryFn: async () => {
      const response = await usuarioService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching usuarios');
      return { items: response.data?.items || [], totalCount: response.data?.totalCount || 0 };
    }
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  const createMutation = useMutation({
    mutationFn: (payload: CreateUsuarioPayload) => usuarioService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUsuarioPayload) => usuarioService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        setIsFormOpen(false);
        setSelectedUsuario(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usuarioService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        setIsDeleteOpen(false);
        setSelectedUsuario(null);
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
    selectedUsuario,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedUsuario(null); setIsFormOpen(true); },
    handleOpenEdit: (u: Usuario) => { setSelectedUsuario(u); setIsFormOpen(true); },
    handleOpenDelete: (u: Usuario) => { setSelectedUsuario(u); setIsDeleteOpen(true); },
    
    createUsuario: async (payload: CreateUsuarioPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateUsuario: async (payload: UpdateUsuarioPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteUsuario: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
