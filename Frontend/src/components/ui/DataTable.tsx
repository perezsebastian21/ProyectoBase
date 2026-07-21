'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, Inbox } from 'lucide-react';

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
  onRowClick?: (row: T) => void;
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
  onRowClick,
  isLoading,
  emptyMessage = 'No hay datos disponibles.',
  page,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="w-full rounded-3xl border border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface dark:bg-slate-900/40 shadow-xl shadow-blue-500/5 dark:shadow-none backdrop-blur-md overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-brand-surface-bright/20 dark:border-white/5 bg-gradient-to-r from-slate-100/80 via-blue-50/30 to-slate-100/80 dark:from-slate-950/60 dark:via-slate-900/40 dark:to-slate-950/60">
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 select-none ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th scope="col" className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right select-none">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-200">
            {isLoading ? (
              /* Loading State */
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-2 border-brand-primary/20 animate-ping" />
                      <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
                      Cargando información...
                    </p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              /* Empty State */
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                      <Inbox className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              /* Data Rows */
              data.map((row, rowIdx) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`group transition-all duration-200 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${
                    rowIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/40 dark:bg-white/[0.01]'
                  } hover:bg-blue-500/5 dark:hover:bg-blue-400/5`}
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={`px-6 py-4 whitespace-nowrap text-xs font-medium ${col.className || ''}`}
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}

                  {/* Actions column */}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
                            title="Editar registro"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                            className="p-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
                            title="Eliminar registro"
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

      {/* Pagination Footer */}
      {totalPages !== undefined && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-brand-surface-bright/20 dark:border-white/5 px-6 py-3.5 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Página <span className="font-bold text-slate-800 dark:text-slate-100">{page}</span> de{' '}
            <span className="font-bold text-slate-800 dark:text-slate-100">{totalPages}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(page! - 1)}
              disabled={page === 1}
              className="flex items-center justify-center p-1.5 rounded-xl border border-brand-surface-bright/20 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-brand-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onPageChange?.(page! + 1)}
              disabled={page === totalPages}
              className="flex items-center justify-center p-1.5 rounded-xl border border-brand-surface-bright/20 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-brand-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
