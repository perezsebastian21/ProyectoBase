'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '../services/auditLogService';
import { useDebounce } from '@/hooks/useDebounce';

export function useAuditLogs() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 450);

  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['auditLogs', page, limit, debouncedSearch],
    queryFn: async () => {
      const response = await auditLogService.findQP(page, limit, debouncedSearch);
      if (!response.success) throw new Error(response.errorMessage || 'Error fetching audit logs');
      return { items: response.data?.items || [], totalCount: response.data?.totalCount || 0 };
    },
  });

  const items = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;
  const error = queryError ? (queryError as Error).message : null;

  return {
    items,
    totalCount,
    isLoading,
    error,
    page,
    limit,
    searchQuery,
    setPage,
    setLimit,
    setSearchQuery,
  };
}
