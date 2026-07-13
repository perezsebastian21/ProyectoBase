'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { amenityService } from '../services/amenityService';
import { complejoService } from '../../complejos/services/complejoService';
import type { Amenity, CreateAmenityPayload, UpdateAmenityPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useAmenities() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

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
    queryKey: ['amenities', page, limit, debouncedSearch, complejos],
    queryFn: async () => {
      const response = await amenityService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching amenities');
      
      const enrichedItems = (response.data?.items || []).map((amenity) => {
        const complejo = complejos.find(c => c.idComplejo === amenity.idComplejo);
        return {
          ...amenity,
          nombreComplejo: complejo ? complejo.nombre : 'Complejo desconocido',
        };
      });

      return { items: enrichedItems, totalCount: response.data?.totalCount || 0 };
    },
    enabled: !!complejosData,
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateAmenityPayload) => amenityService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['amenities'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAmenityPayload) => amenityService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['amenities'] });
        setIsFormOpen(false);
        setSelectedAmenity(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => amenityService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['amenities'] });
        setIsDeleteOpen(false);
        setSelectedAmenity(null);
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
    selectedAmenity,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedAmenity(null); setIsFormOpen(true); },
    handleOpenEdit: (a: Amenity) => { setSelectedAmenity(a); setIsFormOpen(true); },
    handleOpenDelete: (a: Amenity) => { setSelectedAmenity(a); setIsDeleteOpen(true); },
    
    createAmenity: async (payload: CreateAmenityPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateAmenity: async (payload: UpdateAmenityPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteAmenity: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
