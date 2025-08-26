
import { useMemo, useCallback } from 'react';
import { useLoader } from '@/contexts/LoaderContext';


interface GlobalLoadersOptions {
  readonly enableDebugging?: boolean;
  readonly onLoaderChange?: (loaderName: string, loading: boolean) => void;
  readonly aggregateStates?: boolean;
}

interface GlobalLoadersReturn {
  
  readonly isUploadingModel: boolean;
  readonly isUploadingDataset: boolean;
  readonly isBuyingAsset: boolean;
  readonly isDownloadingAsset: boolean;
  readonly isBuyingTokens: boolean;
  
  
  readonly setUploadModelLoading: (loading: boolean) => void;
  readonly setUploadDatasetLoading: (loading: boolean) => void;
  readonly setBuyingAssetLoading: (loading: boolean) => void;
  readonly setDownloadingAssetLoading: (loading: boolean) => void;
  readonly setBuyingTokensLoading: (loading: boolean) => void;
  readonly resetAllLoaders: () => void;
  
  
  readonly loaders: any;
  
  
  readonly hasAnyLoading: boolean;
  readonly totalLoadingStates: number;
  readonly getLoadingStats: () => LoadingStats;
  readonly getActiveLoaders: () => string[];
}

interface LoadingStats {
  readonly totalLoaders: number;
  readonly activeLoaders: number;
  readonly inactiveLoaders: number;
  readonly loadingPercentage: number;
  readonly activeLoaderNames: string[];
}

interface GlobalLoadersMetadata {
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: readonly string[];
  readonly dependencies: readonly string[];
}

interface GlobalLoadersUtility {
  readonly getMetadata: () => GlobalLoadersMetadata;
  readonly validateOptions: (options: Partial<GlobalLoadersOptions>) => boolean;
  readonly createDebugInfo: (options: GlobalLoadersOptions) => DebugInfo;
  readonly getStats: () => GlobalLoadersStats;
  readonly calculateLoadingStats: (loaders: any) => LoadingStats;
}

interface DebugInfo {
  readonly hookName: string;
  readonly aggregateStates: boolean;
  readonly debuggingEnabled: boolean;
  readonly timestamp: string;
}

interface GlobalLoadersStats {
  totalCalls: number;
  successfulLoaderChanges: number;
  resetOperations: number;
  lastUpdated: string;
}


const GLOBAL_LOADERS_METADATA: GlobalLoadersMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'type-safe-loading-states',
    'individual-loader-control',
    'aggregated-loading-states',
    'performance-optimized',
    'debugging-support',
    'loading-statistics'
  ],
  dependencies: ['react', 'useMemo', 'useCallback', 'LoaderContext']
} as const;


let globalLoadersStats: GlobalLoadersStats = {
  totalCalls: 0,
  successfulLoaderChanges: 0,
  resetOperations: 0,
  lastUpdated: new Date().toISOString()
};


const globalLoadersUtils: GlobalLoadersUtility = {
  
  getMetadata: (): GlobalLoadersMetadata => {
    return GLOBAL_LOADERS_METADATA;
  },

  
  validateOptions: (options: Partial<GlobalLoadersOptions>): boolean => {
    if (options.enableDebugging !== undefined && typeof options.enableDebugging !== 'boolean') {
      return false;
    }

    if (options.aggregateStates !== undefined && typeof options.aggregateStates !== 'boolean') {
      return false;
    }

    return true;
  },

  
  createDebugInfo: (options: GlobalLoadersOptions): DebugInfo => {
    return {
      hookName: 'useGlobalLoaders',
      aggregateStates: options.aggregateStates ?? true,
      debuggingEnabled: options.enableDebugging ?? false,
      timestamp: new Date().toISOString()
    };
  },

  
  getStats: (): GlobalLoadersStats => {
    return { ...globalLoadersStats };
  },

  
  calculateLoadingStats: (loaders: any): LoadingStats => {
    const loaderNames = Object.keys(loaders);
    const activeLoaders = loaderNames.filter(name => loaders[name]);
    const inactiveLoaders = loaderNames.filter(name => !loaders[name]);
    const loadingPercentage = loaderNames.length > 0 ? (activeLoaders.length / loaderNames.length) * 100 : 0;

    return {
      totalLoaders: loaderNames.length,
      activeLoaders: activeLoaders.length,
      inactiveLoaders: inactiveLoaders.length,
      loadingPercentage,
      activeLoaderNames: activeLoaders
    };
  }
} as const;


export function useGlobalLoaders() {
  return useGlobalLoadersWithOptions();
}


export function useGlobalLoadersWithOptions(options: GlobalLoadersOptions = {}): GlobalLoadersReturn {
  const {
    enableDebugging = false,
    onLoaderChange,
    aggregateStates = true
  } = options;

  
  globalLoadersStats.totalCalls++;
  globalLoadersStats.lastUpdated = new Date().toISOString();

  
  if (!globalLoadersUtils.validateOptions(options)) {
    
  }

  
  const { 
    loaders, 
    setUploadModelLoading, 
    setUploadDatasetLoading, 
    setBuyingAssetLoading, 
    setDownloadingAssetLoading, 
    setBuyingTokensLoading, 
    resetAllLoaders 
  } = useLoader();

  
  const debugInfo = useMemo(() => {
    if (!enableDebugging) return null;
    return globalLoadersUtils.createDebugInfo(options);
  }, [enableDebugging, options]);

  
  const loadingStats = useMemo(() => {
    if (!aggregateStates) return null;
    return globalLoadersUtils.calculateLoadingStats(loaders);
  }, [loaders, aggregateStates]);

  
  const hasAnyLoading = useMemo(() => {
    if (!aggregateStates) return false;
    return Object.values(loaders).some(Boolean);
  }, [loaders, aggregateStates]);

  const totalLoadingStates = useMemo(() => {
    if (!aggregateStates) return 0;
    return Object.values(loaders).filter(Boolean).length;
  }, [loaders, aggregateStates]);

  
  const enhancedSetUploadModelLoading = useCallback((loading: boolean) => {
    setUploadModelLoading(loading);
    globalLoadersStats.successfulLoaderChanges++;
    onLoaderChange?.('uploadModel', loading);
    
    if (enableDebugging && debugInfo) {
     
    }
  }, [setUploadModelLoading, onLoaderChange, enableDebugging, debugInfo]);

  const enhancedSetUploadDatasetLoading = useCallback((loading: boolean) => {
    setUploadDatasetLoading(loading);
    globalLoadersStats.successfulLoaderChanges++;
    onLoaderChange?.('uploadDataset', loading);
    
    if (enableDebugging && debugInfo) {
   
    }
  }, [setUploadDatasetLoading, onLoaderChange, enableDebugging, debugInfo]);

  const enhancedSetBuyingAssetLoading = useCallback((loading: boolean) => {
    setBuyingAssetLoading(loading);
    globalLoadersStats.successfulLoaderChanges++;
    onLoaderChange?.('buyingAsset', loading);
    
    if (enableDebugging && debugInfo) {
    
    }
  }, [setBuyingAssetLoading, onLoaderChange, enableDebugging, debugInfo]);

  const enhancedSetDownloadingAssetLoading = useCallback((loading: boolean) => {
    setDownloadingAssetLoading(loading);
    globalLoadersStats.successfulLoaderChanges++;
    onLoaderChange?.('downloadingAsset', loading);
    
    if (enableDebugging && debugInfo) {
   
    }
  }, [setDownloadingAssetLoading, onLoaderChange, enableDebugging, debugInfo]);

  const enhancedSetBuyingTokensLoading = useCallback((loading: boolean) => {
    setBuyingTokensLoading(loading);
    globalLoadersStats.successfulLoaderChanges++;
    onLoaderChange?.('buyingTokens', loading);
    
    if (enableDebugging && debugInfo) {
     
    }
  }, [setBuyingTokensLoading, onLoaderChange, enableDebugging, debugInfo]);

  const enhancedResetAllLoaders = useCallback(() => {
    resetAllLoaders();
    globalLoadersStats.resetOperations++;
    
    if (enableDebugging && debugInfo) {
     
    }
  }, [resetAllLoaders, enableDebugging, debugInfo]);

  
  const getLoadingStats = useCallback((): LoadingStats => {
    return globalLoadersUtils.calculateLoadingStats(loaders);
  }, [loaders]);

  
  const getActiveLoaders = useCallback((): string[] => {
    return Object.entries(loaders)
      .filter(([_, loading]) => loading)
      .map(([name, _]) => name);
  }, [loaders]);

  
  return {
    
    isUploadingModel: loaders.uploadModel,
    isUploadingDataset: loaders.uploadDataset,
    isBuyingAsset: loaders.buyingAsset,
    isDownloadingAsset: loaders.downloadingAsset,
    isBuyingTokens: loaders.buyingTokens,
    

    setUploadModelLoading: enhancedSetUploadModelLoading,
    setUploadDatasetLoading: enhancedSetUploadDatasetLoading,
    setBuyingAssetLoading: enhancedSetBuyingAssetLoading,
    setDownloadingAssetLoading: enhancedSetDownloadingAssetLoading,
    setBuyingTokensLoading: enhancedSetBuyingTokensLoading,
    resetAllLoaders: enhancedResetAllLoaders,
    
    loaders,
    
    hasAnyLoading,
    totalLoadingStates,
    getLoadingStats,
    getActiveLoaders
  };
}


export function useGlobalLoadersSimple() {
  const { loaders, setUploadModelLoading, setUploadDatasetLoading, setBuyingAssetLoading, setDownloadingAssetLoading, setBuyingTokensLoading, resetAllLoaders } = useLoader();
  
  return {
    isUploadingModel: loaders.uploadModel,
    isUploadingDataset: loaders.uploadDataset,
    isBuyingAsset: loaders.buyingAsset,
    isDownloadingAsset: loaders.downloadingAsset,
    isBuyingTokens: loaders.buyingTokens,
    
    setUploadModelLoading,
    setUploadDatasetLoading,
    setBuyingAssetLoading,
    setDownloadingAssetLoading,
    setBuyingTokensLoading,
    resetAllLoaders,
    
    loaders
  };
}

export { 
  globalLoadersUtils, 
  GLOBAL_LOADERS_METADATA
};

  
export type { 
  GlobalLoadersOptions, 
  GlobalLoadersReturn, 
  GlobalLoadersMetadata, 
  GlobalLoadersUtility, 
  DebugInfo, 
  GlobalLoadersStats,
  LoadingStats
}; 