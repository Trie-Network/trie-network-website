
import { useState, useCallback, useMemo } from 'react';


interface UseLikesOptions {
  readonly enableDebugging?: boolean;
  readonly onLikeChange?: (itemId: string, isLiked: boolean, newCount: number) => void;
  readonly persistLikes?: boolean;
  readonly storageKey?: string;
}

interface UseLikesResult {
  readonly likedItems: Record<string, boolean>;
  readonly likeCounts: Record<string, number>;
  readonly handleLike: (itemId: string, currentLikes: string) => void;
  readonly isLiked: (itemId: string) => boolean;
  readonly getLikeCount: (itemId: string) => number;
  readonly getLikeStats: () => LikeStats;
  readonly clearLikes: () => void;
  readonly toggleLike: (itemId: string) => void;
}

interface LikeStats {
  readonly totalLikedItems: number;
  readonly totalLikes: number;
  readonly averageLikesPerItem: number;
  readonly mostLikedItem?: string;
  readonly leastLikedItem?: string;
}

interface UseLikesMetadata {
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: readonly string[];
  readonly dependencies: readonly string[];
}

interface UseLikesUtility {
  readonly getMetadata: () => UseLikesMetadata;
  readonly validateOptions: (options: Partial<UseLikesOptions>) => boolean;
  readonly createDebugInfo: (options: UseLikesOptions) => DebugInfo;
  readonly getStats: () => UseLikesStats;
  readonly calculateLikeStats: (likedItems: Record<string, boolean>, likeCounts: Record<string, number>) => LikeStats;
  readonly parseLikeCount: (currentLikes: string) => number;
}

interface DebugInfo {
  readonly hookName: string;
  readonly persistLikes: boolean;
  readonly debuggingEnabled: boolean;
  readonly timestamp: string;
}

interface UseLikesStats {
  totalCalls: number;
  successfulLikes: number;
  successfulUnlikes: number;
  clearOperations: number;
  lastUpdated: string;
}


const USE_LIKES_METADATA: UseLikesMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'type-safe-like-management',
    'individual-item-tracking',
    'like-count-management',
    'performance-optimized',
    'debugging-support',
    'like-statistics'
  ],
  dependencies: ['react', 'useState', 'useCallback', 'useMemo']
} as const;


let useLikesStats: UseLikesStats = {
  totalCalls: 0,
  successfulLikes: 0,
  successfulUnlikes: 0,
  clearOperations: 0,
  lastUpdated: new Date().toISOString()
};


const useLikesUtils: UseLikesUtility = {
  
  getMetadata: (): UseLikesMetadata => {
    return USE_LIKES_METADATA;
  },

  
  validateOptions: (options: Partial<UseLikesOptions>): boolean => {
    if (options.enableDebugging !== undefined && typeof options.enableDebugging !== 'boolean') {
      return false;
    }

    if (options.persistLikes !== undefined && typeof options.persistLikes !== 'boolean') {
      return false;
    }

    if (options.storageKey !== undefined && typeof options.storageKey !== 'string') {
      return false;
    }

    return true;
  },

  
  createDebugInfo: (options: UseLikesOptions): DebugInfo => {
    return {
      hookName: 'useLikes',
      persistLikes: options.persistLikes ?? false,
      debuggingEnabled: options.enableDebugging ?? false,
      timestamp: new Date().toISOString()
    };
  },

  
  getStats: (): UseLikesStats => {
    return { ...useLikesStats };
  },

  
  calculateLikeStats: (likedItems: Record<string, boolean>, likeCounts: Record<string, number>): LikeStats => {
    const likedItemIds = Object.keys(likedItems).filter(id => likedItems[id]);
    const totalLikedItems = likedItemIds.length;
    const totalLikes = Object.values(likeCounts).reduce((sum, count) => sum + count, 0);
    const averageLikesPerItem = Object.keys(likeCounts).length > 0 ? totalLikes / Object.keys(likeCounts).length : 0;

    
    const sortedItems = Object.entries(likeCounts).sort(([, a], [, b]) => b - a);
    const mostLikedItem = sortedItems.length > 0 ? sortedItems[0][0] : undefined;
    const leastLikedItem = sortedItems.length > 0 ? sortedItems[sortedItems.length - 1][0] : undefined;

    return {
      totalLikedItems,
      totalLikes,
      averageLikesPerItem,
      mostLikedItem,
      leastLikedItem
    };
  },

  
  parseLikeCount: (currentLikes: string): number => {
    return parseInt(currentLikes.replace(/[^0-9]/g, ''), 10) || 0;
  }
} as const;


export function useLikes(): UseLikesResult {
  return useLikesWithOptions();
}


export function useLikesWithOptions(options: UseLikesOptions = {}): UseLikesResult {
  const {
    enableDebugging = false,
    onLikeChange,
    persistLikes = false,
    storageKey = 'useLikes'
  } = options;

  
  useLikesStats.totalCalls++;
  useLikesStats.lastUpdated = new Date().toISOString();

  
  if (!useLikesUtils.validateOptions(options)) {

  }

  
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  
  const debugInfo = useMemo(() => {
    if (!enableDebugging) return null;
    return useLikesUtils.createDebugInfo(options);
  }, [enableDebugging, options]);

  
  const likeStats = useMemo(() => {
    return useLikesUtils.calculateLikeStats(likedItems, likeCounts);
  }, [likedItems, likeCounts]);

  
  const handleLike = useCallback((itemId: string, currentLikes: string): void => {
    
    const parsedLikes = useLikesUtils.parseLikeCount(currentLikes);

    
    if (!likeCounts[itemId]) {
      setLikeCounts(prev => ({
        ...prev,
        [itemId]: parsedLikes
      }));
    }

    setLikedItems(prev => {
      const wasLiked = prev[itemId];
      const newLikedItems = { ...prev, [itemId]: !wasLiked };
      
      
      setLikeCounts(prevCounts => {
        const newCount = (prevCounts[itemId] || parsedLikes) + (!wasLiked ? 1 : -1);
        const newCounts = { ...prevCounts, [itemId]: newCount };
        
        
        if (!wasLiked) {
          useLikesStats.successfulLikes++;
        } else {
          useLikesStats.successfulUnlikes++;
        }
        
        
        onLikeChange?.(itemId, !wasLiked, newCount);
        
        
        if (enableDebugging && debugInfo) {
        
        }
        
        return newCounts;
      });
      
      return newLikedItems;
    });
  }, [likeCounts, onLikeChange, enableDebugging, debugInfo]);


  const isLiked = useCallback((itemId: string): boolean => {
    return likedItems[itemId] || false;
  }, [likedItems]);

  
  const getLikeCount = useCallback((itemId: string): number => {
    return likeCounts[itemId] || 0;
  }, [likeCounts]);

  
  const getLikeStats = useCallback((): LikeStats => {
    return likeStats;
  }, [likeStats]);

  
  const clearLikes = useCallback((): void => {
    setLikedItems({});
    setLikeCounts({});
    useLikesStats.clearOperations++;
    
    if (enableDebugging && debugInfo) {
     
    }
  }, [enableDebugging, debugInfo]);

  
  const toggleLike = useCallback((itemId: string): void => {
    const currentCount = likeCounts[itemId] || 0;
    const currentLikes = currentCount.toString();
    handleLike(itemId, currentLikes);
  }, [likeCounts, handleLike]);

  
  return {
    likedItems,
    likeCounts,
    handleLike,
    isLiked,
    getLikeCount,
    getLikeStats,
    clearLikes,
    toggleLike
  };
}


export function useLikesSimple() {
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const handleLike = (itemId: string, currentLikes: string): void => {
    
    if (!likeCounts[itemId]) {
      setLikeCounts(prev => ({
        ...prev,
        [itemId]: parseInt(currentLikes.replace(/[^0-9]/g, ''), 10) || 0
      }));
    }

    setLikedItems(prev => {
      const wasLiked = prev[itemId];
      const newLikedItems = { ...prev, [itemId]: !wasLiked };
      
      
      setLikeCounts(prevCounts => ({
        ...prevCounts,
        [itemId]: (prevCounts[itemId] || 0) + (!wasLiked ? 1 : -1)
      }));
      
      return newLikedItems;
    });
  };

  return { likedItems, likeCounts, handleLike };
}


export { 
  useLikesUtils, 
  USE_LIKES_METADATA
};


export type { 
  UseLikesOptions, 
  UseLikesResult, 
  UseLikesMetadata, 
  UseLikesUtility, 
  DebugInfo, 
  UseLikesStats,
  LikeStats
};