

import { useState, useEffect, useMemo, useCallback } from 'react';


interface FilteredItemsOptions {
  readonly itemsPerPage?: number;
  readonly initialFilter?: string | null;
  readonly enableDebugging?: boolean;
  readonly onFilterChange?: (filters: Set<string>) => void;
  readonly onPageChange?: (page: number) => void;
}

interface FilteredItemsReturn<T> {
  readonly filteredItems: T[];
  readonly totalItems: number;
  readonly currentPage: number;
  readonly totalPages: number;
  readonly selectedFilters: Set<string>;
  readonly clearFilters: () => void;
  readonly setCurrentPage: (page: number) => void;
  readonly handleFilterSelect: (filter: string) => void;
  readonly isFiltered: boolean;
  readonly hasFilters: boolean;
  readonly getFilterStats: () => FilterStats;
}

interface FilterStats {
  readonly totalItems: number;
  readonly filteredItems: number;
  readonly selectedFilters: number;
  readonly currentPage: number;
  readonly totalPages: number;
  readonly itemsPerPage: number;
}

interface FilteredItemsMetadata {
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: readonly string[];
  readonly dependencies: readonly string[];
}

interface FilteredItemsUtility {
  readonly getMetadata: () => FilteredItemsMetadata;
  readonly validateOptions: (options: Partial<FilteredItemsOptions>) => boolean;
  readonly createDebugInfo: (options: FilteredItemsOptions) => DebugInfo;
  readonly getStats: () => FilteredItemsStats;
  readonly calculatePagination: (totalItems: number, itemsPerPage: number, currentPage: number) => PaginationInfo;
}

interface DebugInfo {
  readonly hookName: string;
  readonly itemsPerPage: number;
  readonly initialFilter: string | null;
  readonly debuggingEnabled: boolean;
  readonly timestamp: string;
}

interface FilteredItemsStats {
  totalCalls: number;
  successfulFilters: number;
  clearedFilters: number;
  pageChanges: number;
  lastUpdated: string;
}

interface PaginationInfo {
  readonly totalPages: number;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}


const FILTERED_ITEMS_METADATA: FilteredItemsMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'type-safe-filtering',
    'category-based-filtering',
    'pagination-support',
    'performance-optimized',
    'url-filter-initialization',
    'multiple-filter-selection',
    'debugging-support'
  ],
  dependencies: ['react', 'useState', 'useEffect', 'useMemo', 'useCallback']
} as const;


let filteredItemsStats: FilteredItemsStats = {
  totalCalls: 0,
  successfulFilters: 0,
  clearedFilters: 0,
  pageChanges: 0,
  lastUpdated: new Date().toISOString()
};


const filteredItemsUtils: FilteredItemsUtility = {
  
  getMetadata: (): FilteredItemsMetadata => {
    return FILTERED_ITEMS_METADATA;
  },

  
  validateOptions: (options: Partial<FilteredItemsOptions>): boolean => {
    if (options.itemsPerPage !== undefined && (typeof options.itemsPerPage !== 'number' || options.itemsPerPage < 1)) {
      return false;
    }

    if (options.initialFilter !== undefined && options.initialFilter !== null && typeof options.initialFilter !== 'string') {
      return false;
    }

    return true;
  },

  
  createDebugInfo: (options: FilteredItemsOptions): DebugInfo => {
    return {
      hookName: 'useFilteredItems',
      itemsPerPage: options.itemsPerPage ?? 12,
      initialFilter: options.initialFilter ?? null,
      debuggingEnabled: options.enableDebugging ?? false,
      timestamp: new Date().toISOString()
    };
  },

  
  getStats: (): FilteredItemsStats => {
    return { ...filteredItemsStats };
  },

  
  calculatePagination: (totalItems: number, itemsPerPage: number, currentPage: number): PaginationInfo => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }
} as const;



export function useFilteredItems<T extends { categories: string[] }>(
  items: T[],
  itemsPerPage: number = 12,
  initialFilter?: string | null
) {
  return useFilteredItemsWithOptions(items, { itemsPerPage, initialFilter });
}


export function useFilteredItemsWithOptions<T extends { categories: string[] }>(
  items: T[],
  options: FilteredItemsOptions = {}
): FilteredItemsReturn<T> {
  const {
    itemsPerPage = 12,
    initialFilter = null,
    enableDebugging = false,
    onFilterChange,
    onPageChange
  } = options;

  
  filteredItemsStats.totalCalls++;
  filteredItemsStats.lastUpdated = new Date().toISOString();

  
  if (!filteredItemsUtils.validateOptions(options)) {
   
  }

  
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  
  const debugInfo = useMemo(() => {
    if (!enableDebugging) return null;
    return filteredItemsUtils.createDebugInfo(options);
  }, [enableDebugging, options]);

  
  useEffect(() => {
    if (initialFilter && items.length > 0) {
      setSelectedFilters(new Set([initialFilter]));
      filteredItemsStats.successfulFilters++;
    }
  }, [initialFilter, items.length]);

  
  const filteredItems = useMemo(() => {
    if (!items || selectedFilters.size === 0) return items || [];
    
    const filtered = items.filter(item =>
      item.categories?.some(category =>
        Array.from(selectedFilters).includes(category)
      )
    );

    
    if (enableDebugging && debugInfo) {
     
    }

    return filtered;
  }, [items, selectedFilters, enableDebugging, debugInfo]);

  
  const totalItems = filteredItems?.length || 0;
  const paginationInfo = useMemo(() => {
    return filteredItemsUtils.calculatePagination(totalItems, itemsPerPage, currentPage);
  }, [totalItems, itemsPerPage, currentPage]);

  
  const paginatedItems = useMemo(() => {
    return filteredItems.slice(paginationInfo.startIndex, paginationInfo.endIndex);
  }, [filteredItems, paginationInfo.startIndex, paginationInfo.endIndex]);

  
  const clearFilters = useCallback(() => {
    setSelectedFilters(new Set());
    setCurrentPage(1);
    filteredItemsStats.clearedFilters++;
    onFilterChange?.(new Set());
    onPageChange?.(1);
  }, [onFilterChange, onPageChange]);


  const setCurrentPageCallback = useCallback((page: number) => {
    setCurrentPage(page);
    filteredItemsStats.pageChanges++;
    onPageChange?.(page);
  }, [onPageChange]);


  const handleFilterSelect = useCallback((filter: string) => {
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
    filteredItemsStats.successfulFilters++;
    onFilterChange?.(selectedFilters);
    onPageChange?.(1);
  }, [selectedFilters, onFilterChange, onPageChange]);

 
  const getFilterStats = useCallback((): FilterStats => {
    return {
      totalItems: items.length,
      filteredItems: totalItems,
      selectedFilters: selectedFilters.size,
      currentPage,
      totalPages: paginationInfo.totalPages,
      itemsPerPage
    };
  }, [items.length, totalItems, selectedFilters.size, currentPage, paginationInfo.totalPages, itemsPerPage]);

  
  return {
    filteredItems: paginatedItems,
    totalItems,
    currentPage,
    totalPages: paginationInfo.totalPages,
    selectedFilters,
    clearFilters,
    setCurrentPage: setCurrentPageCallback,
    handleFilterSelect,
    isFiltered: selectedFilters.size > 0,
    hasFilters: selectedFilters.size > 0,
    getFilterStats
  };
}


export function useFilteredItemsSimple<T extends { categories: string[] }>(
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


export { 
  filteredItemsUtils, 
  FILTERED_ITEMS_METADATA
};


export type { 
  FilteredItemsOptions, 
  FilteredItemsReturn, 
  FilteredItemsMetadata, 
  FilteredItemsUtility, 
  DebugInfo, 
  FilteredItemsStats,
  FilterStats,
  PaginationInfo
};