'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { consorcioService } from '../services/consorcioService';
import type { Consorcio, CreateConsorcioPayload, UpdateConsorcioPayload } from '../types';

export function useConsorcios() {
  const [items, setItems] = useState<Consorcio[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parámetros de búsqueda y paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedConsorcio, setSelectedConsorcio] = useState<Consorcio | null>(null);

  // Evitar búsquedas simultáneas o loops
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce para la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Volver a la primera página en una búsqueda nueva
    }, 450);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Carga de datos
  const fetchConsorcios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await consorcioService.findQP(page, limit, debouncedSearch);
      if (response.success && response.data) {
        setItems(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        setError(response.errorMessage || 'Error al obtener la lista de consorcios.');
      }
    } catch (err) {
      setError('Ocurrió un error al conectarse con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  // Recargar cuando cambian los filtros
  useEffect(() => {
    fetchConsorcios();
  }, [fetchConsorcios]);

  // CRUD: Crear
  const createConsorcio = async (payload: CreateConsorcioPayload) => {
    setIsSubmitLoading(true);
    setError(null);
    try {
      const response = await consorcioService.create(payload);
      if (response.success) {
        setIsFormOpen(false);
        fetchConsorcios(); // Refrescar lista
        return { success: true };
      } else {
        return { success: false, error: response.errorMessage || 'Error al crear el consorcio.' };
      }
    } catch (err) {
      return { success: false, error: 'Ocurrió un error de red.' };
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // CRUD: Modificar
  const updateConsorcio = async (payload: UpdateConsorcioPayload) => {
    setIsSubmitLoading(true);
    setError(null);
    try {
      const response = await consorcioService.update(payload);
      if (response.success) {
        setIsFormOpen(false);
        setSelectedConsorcio(null);
        fetchConsorcios(); // Refrescar lista
        return { success: true };
      } else {
        return { success: false, error: response.errorMessage || 'Error al actualizar el consorcio.' };
      }
    } catch (err) {
      return { success: false, error: 'Ocurrió un error de red.' };
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // CRUD: Eliminar
  const deleteConsorcio = async (id: number) => {
    setIsSubmitLoading(true);
    setError(null);
    try {
      const response = await consorcioService.delete(id);
      if (response.success) {
        setIsDeleteOpen(false);
        setSelectedConsorcio(null);
        
        // Si eliminamos el último elemento de la página actual y no es la primera, volvemos una página atrás
        if (items.length === 1 && page > 1) {
          setPage(prev => prev - 1);
        } else {
          fetchConsorcios();
        }
        return { success: true };
      } else {
        return { success: false, error: response.errorMessage || 'Error al eliminar el consorcio.' };
      }
    } catch (err) {
      return { success: false, error: 'Ocurrió un error de red.' };
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Abrir formulario para Crear
  const handleOpenCreate = () => {
    setSelectedConsorcio(null);
    setIsFormOpen(true);
  };

  // Abrir formulario para Editar
  const handleOpenEdit = (consorcio: Consorcio) => {
    setSelectedConsorcio(consorcio);
    setIsFormOpen(true);
  };

  // Abrir confirmación de Eliminación
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
    createConsorcio,
    updateConsorcio,
    deleteConsorcio,
    refreshList: fetchConsorcios,
  };
}
