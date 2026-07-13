'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { amenityConfigService } from '../services/amenityConfigService';
import { amenityService } from '../services/amenityService';
import type { AmenityConfig, CreateAmenityConfigPayload, UpdateAmenityConfigPayload } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useAmenityConfigs() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AmenityConfig | null>(null);

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
    queryKey: ['amenityConfigs', page, limit, debouncedSearch, amenities],
    queryFn: async () => {
      const response = await amenityConfigService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching configs');
      
      const enrichedItems = (response.data?.items || []).map((config) => {
        const amenity = amenities.find(a => a.idAmenity === config.idAmenity);
        return {
          ...config,
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
    mutationFn: (payload: CreateAmenityConfigPayload) => amenityConfigService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['amenityConfigs'] });
        setIsFormOpen(false);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAmenityConfigPayload) => amenityConfigService.update(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['amenityConfigs'] });
        setIsFormOpen(false);
        setSelectedConfig(null);
      } else throw new Error(res.errorMessage || 'Error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => amenityConfigService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['amenityConfigs'] });
        setIsDeleteOpen(false);
        setSelectedConfig(null);
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
    isLoadingAmenities,
    
    isFormOpen,
    isDeleteOpen,
    selectedConfig,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate: () => { setSelectedConfig(null); setIsFormOpen(true); },
    handleOpenEdit: (c: AmenityConfig) => { setSelectedConfig(c); setIsFormOpen(true); },
    handleOpenDelete: (c: AmenityConfig) => { setSelectedConfig(c); setIsDeleteOpen(true); },
    
    createConfig: async (payload: CreateAmenityConfigPayload) => {
      try { await createMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    updateConfig: async (payload: UpdateAmenityConfigPayload) => {
      try { await updateMutation.mutateAsync(payload); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
    deleteConfig: async (id: number) => {
      try { await deleteMutation.mutateAsync(id); return { success: true }; }
      catch (e: any) { return { success: false, error: e.message }; }
    },
  };
}
