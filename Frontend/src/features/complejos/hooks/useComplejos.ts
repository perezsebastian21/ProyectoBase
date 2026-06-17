'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { complejoService } from '../services/complejoService';
import { consorcioService } from '../../consorcios/services/consorcioService';
import type { Consorcio } from '../../consorcios/types';
import type { Complejo, CreateComplejoPayload, UpdateComplejoPayload } from '../types';

export function useComplejos() {
  const [items, setItems] = useState<Complejo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista de consorcios disponibles para asociar
  const [consorcios, setConsorcios] = useState<Consorcio[]>([]);
  const [isLoadingConsorcios, setIsLoadingConsorcios] = useState(false);
  
  // Parámetros de búsqueda y paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedComplejo, setSelectedComplejo] = useState<Complejo | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce para la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 450);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Carga de Consorcios (para mapeo y dropdown)
  const fetchConsorcios = useCallback(async () => {
    setIsLoadingConsorcios(true);
    try {
      const response = await consorcioService.getAll();
      if (response.success && response.data) {
        setConsorcios(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Error al obtener la lista de consorcios para complejos:', err);
    } finally {
      setIsLoadingConsorcios(false);
    }
    return [];
  }, []);

  // Carga de complejos + mapeo de nombres de consorcios
  const fetchComplejos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Primero asegurar que tenemos la lista de consorcios para mapear el nombre
      let consorciosList = consorcios;
      if (consorciosList.length === 0) {
        consorciosList = await fetchConsorcios();
      }

      const response = await complejoService.findQP(page, limit, debouncedSearch);
      if (response.success && response.data) {
        // Enriquecer los complejos con el nombre del consorcio asociado
        const enrichedItems = response.data.items.map((complejo) => {
          const consorcio = consorciosList.find(c => c.idConsorcio === complejo.idConsorcio);
          return {
            ...complejo,
            nombreConsorcio: consorcio ? consorcio.nombre : 'Consorcio desconocido',
          };
        });
        
        setItems(enrichedItems);
        setTotalCount(response.data.totalCount);
      } else {
        setError(response.errorMessage || 'Error al obtener la lista de complejos.');
      }
    } catch (err) {
      setError('Ocurrió un error al conectarse con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, consorcios, fetchConsorcios]);

  // Recargar al cambiar los filtros de paginación/búsqueda
  useEffect(() => {
    fetchComplejos();
  }, [page, limit, debouncedSearch]);

  // Recargar consorcios al montar
  useEffect(() => {
    fetchConsorcios();
  }, [fetchConsorcios]);

  // CRUD: Crear
  const createComplejo = async (payload: CreateComplejoPayload) => {
    setIsSubmitLoading(true);
    setError(null);
    try {
      const response = await complejoService.create(payload);
      if (response.success) {
        setIsFormOpen(false);
        fetchComplejos();
        return { success: true };
      } else {
        return { success: false, error: response.errorMessage || 'Error al crear el complejo.' };
      }
    } catch (err) {
      return { success: false, error: 'Ocurrió un error de red.' };
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // CRUD: Modificar
  const updateComplejo = async (payload: UpdateComplejoPayload) => {
    setIsSubmitLoading(true);
    setError(null);
    try {
      const response = await complejoService.update(payload);
      if (response.success) {
        setIsFormOpen(false);
        setSelectedComplejo(null);
        fetchComplejos();
        return { success: true };
      } else {
        return { success: false, error: response.errorMessage || 'Error al actualizar el complejo.' };
      }
    } catch (err) {
      return { success: false, error: 'Ocurrió un error de red.' };
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // CRUD: Eliminar
  const deleteComplejo = async (id: number) => {
    setIsSubmitLoading(true);
    setError(null);
    try {
      const response = await complejoService.delete(id);
      if (response.success) {
        setIsDeleteOpen(false);
        setSelectedComplejo(null);
        
        if (items.length === 1 && page > 1) {
          setPage(prev => prev - 1);
        } else {
          fetchComplejos();
        }
        return { success: true };
      } else {
        return { success: false, error: response.errorMessage || 'Error al eliminar el complejo.' };
      }
    } catch (err) {
      return { success: false, error: 'Ocurrió un error de red.' };
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Abrir modal de creación
  const handleOpenCreate = () => {
    // Forzamos actualización de consorcios al abrir formulario
    fetchConsorcios();
    setSelectedComplejo(null);
    setIsFormOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (complejo: Complejo) => {
    fetchConsorcios();
    setSelectedComplejo(complejo);
    setIsFormOpen(true);
  };

  // Abrir confirmación de borrado
  const handleOpenDelete = (complejo: Complejo) => {
    setSelectedComplejo(complejo);
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
    
    // Consorcios cargados para dropdowns
    consorcios,
    isLoadingConsorcios,
    fetchConsorcios,

    // Modales & CRUD
    isFormOpen,
    isDeleteOpen,
    selectedComplejo,
    setIsFormOpen,
    setIsDeleteOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    createComplejo,
    updateComplejo,
    deleteComplejo,
    refreshList: fetchComplejos,
  };
}
