'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mantenimientoService } from '../services/mantenimientoService';
import { amenityService } from '../../amenities/services/amenityService';
import type { Mantenimiento, CreateMantenimientoPayload, UpdateMantenimientoPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useMantenimientos() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<Mantenimiento | null>(null);

  // Queries
  const { data: amenitiesData, isLoading: isLoadingAmenities } = useQuery({
    queryKey: ['amenities', 'all'],
    queryFn: async () => {
      const response = await amenityService.getAll();
      return response.data || [];
    },
  });

  const amenities = amenitiesData || [];

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['mantenimientos', page, limit, debouncedSearch, amenities],
    queryFn: async () => {
      const response = await mantenimientoService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching');
      
      const enrichedItems = (response.data?.items || []).map((mant) => {
        const amenity = amenities.find(a => a.idAmenity === mant.idAmenity);
        return {
          ...mant,
          nombreAmenity: amenity ? amenity.nombre : 'Amenity desconocido',
        };
      });

      return { items: enrichedItems, totalCount: response.data?.totalCount || 0 };
    },
    enabled: !!amenitiesData,
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateMantenimientoPayload) => mantenimientoService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateMantenimientoPayload) => mantenimientoService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
        setIsFormOpen(false);
        setSelectedMantenimiento(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mantenimientoService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
        setIsDeleteOpen(false);
        setSelectedMantenimiento(null);
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
    isLoadingDependencies: isLoadingAmenities,
    
    isFormOpen,
    isDeleteOpen,
    selectedMantenimiento,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedMantenimiento(null); setIsFormOpen(true); },
    handleOpenEdit: (m: Mantenimiento) => { setSelectedMantenimiento(m); setIsFormOpen(true); },
    handleOpenDelete: (m: Mantenimiento) => { setSelectedMantenimiento(m); setIsDeleteOpen(true); },
    
    createMantenimiento: async (payload: CreateMantenimientoPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateMantenimiento: async (payload: UpdateMantenimientoPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteMantenimiento: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
