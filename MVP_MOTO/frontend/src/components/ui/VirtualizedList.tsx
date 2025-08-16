// Lista Virtualizada para Performance
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  loadMore?: () => void;
  hasMore?: boolean;
  overscan?: number; // Número de itens extras para renderizar
  className?: string;
  emptyMessage?: string;
  onScroll?: (scrollTop: number) => void;
}

export const VirtualizedList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  loading = false,
  loadMore,
  hasMore = false,
  overscan = 5,
  className = '',
  emptyMessage = 'Nenhum item encontrado',
  onScroll,
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular quais itens devem ser renderizados
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length - 1, visibleEnd + overscan);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Itens visíveis
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  // Handler de scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);

    // Carregar mais itens quando próximo do final
    if (loadMore && hasMore && !loading) {
      const { scrollHeight, clientHeight } = e.currentTarget;
      const scrolledPercentage = (newScrollTop + clientHeight) / scrollHeight;
      
      if (scrolledPercentage > 0.8) {
        loadMore();
      }
    }
  }, [loadMore, hasMore, loading, onScroll]);

  // Altura total da lista
  const totalHeight = items.length * itemHeight;

  // Offset do primeiro item visível
  const offsetY = visibleRange.start * itemHeight;

  if (items.length === 0 && !loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-500">Carregando...</span>
        </div>
      )}
    </div>
  );
};

// Hook para paginação infinita
interface UseInfiniteScrollOptions<T> {
  fetchData: (page: number, limit: number) => Promise<{
    items: T[];
    total: number;
    hasMore: boolean;
  }>;
  limit?: number;
  initialPage?: number;
}

export const useInfiniteScroll = <T,>({
  fetchData,
  limit = 20,
  initialPage = 1,
}: UseInfiniteScrollOptions<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchData(page, limit);
      
      setItems(prev => [...prev, ...result.items]);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, limit, loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setTotal(0);
    setError(null);
  }, [initialPage]);

  const refresh = useCallback(async () => {
    reset();
    await loadMore();
  }, [reset, loadMore]);

  // Carregar dados iniciais
  useEffect(() => {
    if (items.length === 0 && !loading) {
      loadMore();
    }
  }, []);

  return {
    items,
    loading,
    hasMore,
    total,
    error,
    loadMore,
    reset,
    refresh,
  };
};

// Componente de tabela virtualizada
interface VirtualizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    width?: number;
    render?: (value: any, item: T, index: number) => React.ReactNode;
  }>;
  rowHeight?: number;
  containerHeight?: number;
  loading?: boolean;
  loadMore?: () => void;
  hasMore?: boolean;
  className?: string;
  emptyMessage?: string;
}

export const VirtualizedTable = <T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 60,
  containerHeight = 400,
  loading = false,
  loadMore,
  hasMore = false,
  className = '',
  emptyMessage = 'Nenhum dado encontrado',
}: VirtualizedTableProps<T>) => {
  const renderRow = useCallback((item: T, index: number) => (
    <div className="flex items-center border-b border-gray-200 px-4 hover:bg-gray-50">
      {columns.map((column, colIndex) => {
        const value = item[column.key];
        const content = column.render 
          ? column.render(value, item, index)
          : String(value || '');

        return (
          <div
            key={colIndex}
            className="flex-1 px-2 text-sm text-gray-900 truncate"
            style={{ width: column.width }}
          >
            {content}
          </div>
        );
      })}
    </div>
  ), [columns]);

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          {columns.map((column, index) => (
            <div
              key={index}
              className="flex-1 px-2 text-sm font-medium text-gray-700 truncate"
              style={{ width: column.width }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <VirtualizedList
        items={data}
        itemHeight={rowHeight}
        containerHeight={containerHeight}
        renderItem={renderRow}
        loading={loading}
        loadMore={loadMore}
        hasMore={hasMore}
        emptyMessage={emptyMessage}
      />
    </div>
  );
};

// Hook para busca com debounce
export const useDebouncedSearch = (
  searchFn: (query: string) => Promise<any>,
  delay: number = 300
) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim() === '') {
      setResults([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchFn(query);
        setResults(data);
      } catch (error) {
        console.error('Erro na busca:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, searchFn, delay]);

  return {
    query,
    setQuery,
    results,
    loading,
  };
};