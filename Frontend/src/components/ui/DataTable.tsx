import React from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  // Pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onEdit,
  onDelete,
  isLoading,
  emptyMessage = 'No hay datos disponibles.',
  page,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[var(--brand-surface-bright)] bg-[var(--brand-surface)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--foreground)]">
          <thead className="bg-[var(--brand-surface-container)] text-xs uppercase text-gray-500">
            <tr>
              {columns.map((col, i) => (
                <th key={i} scope="col" className={`px-6 py-4 font-medium ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th scope="col" className="px-6 py-4 font-medium text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--brand-surface-bright)]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent"></div>
                    <span>Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-[var(--brand-surface-container)]/50 transition-colors">
                  {columns.map((col, i) => (
                    <td key={i} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
                      {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages !== undefined && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--brand-surface-bright)] px-6 py-3">
          <div className="text-sm text-gray-500">
            Página <span className="font-medium text-[var(--foreground)]">{page}</span> de{' '}
            <span className="font-medium text-[var(--foreground)]">{totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange?.(page! - 1)}
              disabled={page === 1}
              className="flex items-center justify-center rounded-md border border-[var(--brand-surface-bright)] p-2 hover:bg-[var(--brand-surface-container)] disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page! + 1)}
              disabled={page === totalPages}
              className="flex items-center justify-center rounded-md border border-[var(--brand-surface-bright)] p-2 hover:bg-[var(--brand-surface-container)] disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
