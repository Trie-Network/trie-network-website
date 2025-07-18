import { useState, useMemo, useEffect } from 'react';

export function useFilteredItems<T extends { categories: string[] }>(
  items: T[],
  itemsPerPage: number = 12,
  initialFilter?: string | null
) {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (initialFilter && items.length > 0) {
      setSelectedFilters(new Set([initialFilter]));
    }
  }, [initialFilter]);

  const filteredItems = useMemo(() => {
    if (!items || selectedFilters.size === 0) return items || [];
    return items.filter(item =>
      item.categories?.some(category =>
        Array.from(selectedFilters).includes(category)
      )
    );
  }, [items, selectedFilters]);

  const totalItems = filteredItems?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSelectedFilters(new Set());
    setCurrentPage(1);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilters(prev => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
    setCurrentPage(1);
  };

  return {
    filteredItems: paginatedItems,
    totalItems,
    currentPage,
    totalPages,
    selectedFilters,
    clearFilters,
    setCurrentPage,
    handleFilterSelect
  };
}