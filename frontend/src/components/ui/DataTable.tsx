import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  keyAccessor?: (item: T, index: number) => string;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  keyAccessor,
}: DataTableProps<T>) {
  const getKey = (item: T, index: number): string => {
    if (keyAccessor) return keyAccessor(item, index);
    if (typeof item === 'object' && item !== null && 'id' in item) {
      return String((item as { id: unknown }).id);
    }
    return String(index);
  };
  const getCellValue = (item: T, accessor: Column<T>['accessor']): ReactNode => {
    if (typeof accessor === 'function') {
      return accessor(item);
    }
    return item[accessor] as ReactNode;
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={getKey(item, idx)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className={col.className}>
                      {getCellValue(item, col.accessor)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
