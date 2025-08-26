

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';


interface LoaderState {
  readonly uploadModel: boolean;
  readonly uploadDataset: boolean;
  readonly buyingAsset: boolean;
  readonly downloadingAsset: boolean;
  readonly buyingTokens: boolean;
}

interface LoaderContextType {
  readonly loaders: LoaderState;
  readonly setUploadModelLoading: (loading: boolean) => void;
  readonly setUploadDatasetLoading: (loading: boolean) => void;
  readonly setBuyingAssetLoading: (loading: boolean) => void;
  readonly setDownloadingAssetLoading: (loading: boolean) => void;
  readonly setBuyingTokensLoading: (loading: boolean) => void;
  readonly resetAllLoaders: () => void;
  readonly isLoading: (loaderName: keyof LoaderState) => boolean;
  readonly hasAnyLoading: () => boolean;
  readonly getLoadingCount: () => number;
  readonly setMultipleLoaders: (loaders: Partial<LoaderState>) => void;
  readonly getLoadingStates: () => LoaderState;
}

interface LoaderProviderProps {
  readonly children: ReactNode;
  readonly initialState?: Partial<LoaderState>;
}

interface LoaderMetadata {
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: readonly string[];
  readonly supportedLoaderTypes: readonly string[];
}

interface LoaderUtility {
  readonly validateLoaderState: (state: Partial<LoaderState>) => boolean;
  readonly getLoaderMetadata: () => LoaderMetadata;
  readonly createCustomLoader: (name: string, initialState?: boolean) => any;
  readonly getLoaderStats: () => LoaderStats;
  readonly getActiveLoaders: (state: LoaderState) => readonly string[];
}

interface LoaderStats {
  readonly totalLoaders: number;
  readonly activeLoaders: number;
  readonly inactiveLoaders: number;
  readonly lastUpdated: string;
}


const LOADER_METADATA: LoaderMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'individual-loaders',
    'batch-operations',
    'state-validation',
    'performance-optimized',
    'type-safe'
  ],
  supportedLoaderTypes: [
    'upload-model',
    'upload-dataset',
    'buying-asset',
    'downloading-asset',
    'buying-tokens'
  ]
} as const;


const INITIAL_LOADER_STATE: LoaderState = {
  uploadModel: false,
  uploadDataset: false,
  buyingAsset: false,
  downloadingAsset: false,
  buyingTokens: false,
} as const;


const loaderUtils: LoaderUtility = {
  
  validateLoaderState: (state: Partial<LoaderState>): boolean => {
    
    for (const key in state) {
      if (typeof state[key as keyof LoaderState] !== 'boolean') {
        return false;
      }
    }
    return true;
  },

  
  getLoaderMetadata: (): LoaderMetadata => {
    return LOADER_METADATA;
  },

  
  createCustomLoader: (name: string, initialState: boolean = false): any => {
    
    return {
      name,
      initialState,
      createdAt: new Date().toISOString()
    };
  },

  
  getLoaderStats: (): LoaderStats => {
    return {
      totalLoaders: Object.keys(INITIAL_LOADER_STATE).length,
      activeLoaders: 0, 
      inactiveLoaders: Object.keys(INITIAL_LOADER_STATE).length,
      lastUpdated: new Date().toISOString()
    };
  },

  
  getActiveLoaders: (state: LoaderState): readonly string[] => {
    return Object.entries(state)
      .filter(([_, isLoading]) => isLoading)
      .map(([name]) => name);
  }
} as const;


const LoaderContext = createContext<LoaderContextType | undefined>(undefined);


export function LoaderProvider({ children, initialState = {} }: LoaderProviderProps) {
  
  const [loaders, setLoaders] = useState<LoaderState>(() => {
    const mergedState = { ...INITIAL_LOADER_STATE, ...initialState };
    

    if (!loaderUtils.validateLoaderState(mergedState)) {
     
      return INITIAL_LOADER_STATE;
    }
    
    return mergedState;
  });

  
  const setUploadModelLoading = useCallback((loading: boolean) => {
    setLoaders(prev => ({ ...prev, uploadModel: loading }));
  }, []);

  const setUploadDatasetLoading = useCallback((loading: boolean) => {
    setLoaders(prev => ({ ...prev, uploadDataset: loading }));
  }, []);

  const setBuyingAssetLoading = useCallback((loading: boolean) => {
    setLoaders(prev => ({ ...prev, buyingAsset: loading }));
  }, []);

  const setDownloadingAssetLoading = useCallback((loading: boolean) => {
    setLoaders(prev => ({ ...prev, downloadingAsset: loading }));
  }, []);

  const setBuyingTokensLoading = useCallback((loading: boolean) => {
    setLoaders(prev => ({ ...prev, buyingTokens: loading }));
  }, []);

  
  const resetAllLoaders = useCallback(() => {
    setLoaders(INITIAL_LOADER_STATE);
  }, []);

  
  const isLoading = useCallback((loaderName: keyof LoaderState): boolean => {
    return loaders[loaderName];
  }, [loaders]);

  
  const hasAnyLoading = useCallback((): boolean => {
    return Object.values(loaders).some(isLoading => isLoading);
  }, [loaders]);

  
  const getLoadingCount = useCallback((): number => {
    return Object.values(loaders).filter(isLoading => isLoading).length;
  }, [loaders]);

  
  const setMultipleLoaders = useCallback((newLoaders: Partial<LoaderState>) => {
    setLoaders(prev => ({ ...prev, ...newLoaders }));
  }, []);

  
  const getLoadingStates = useCallback((): LoaderState => {
    return loaders;
  }, [loaders]);

  
  const contextValue = useMemo<LoaderContextType>(() => ({
    loaders,
    setUploadModelLoading,
    setUploadDatasetLoading,
    setBuyingAssetLoading,
    setDownloadingAssetLoading,
    setBuyingTokensLoading,
    resetAllLoaders,
    isLoading,
    hasAnyLoading,
    getLoadingCount,
    setMultipleLoaders,
    getLoadingStates
  }), [
    loaders,
    setUploadModelLoading,
    setUploadDatasetLoading,
    setBuyingAssetLoading,
    setDownloadingAssetLoading,
    setBuyingTokensLoading,
    resetAllLoaders,
    isLoading,
    hasAnyLoading,
    getLoadingCount,
    setMultipleLoaders,
    getLoadingStates
  ]);

  return (
    <LoaderContext.Provider value={contextValue}>
      {children}
    </LoaderContext.Provider>
  );
}


export function useLoader(): LoaderContextType {
  const context = useContext(LoaderContext);
  
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  
  return context;
}


export { 
  loaderUtils, 
  LOADER_METADATA,
  INITIAL_LOADER_STATE
};


export type { 
  LoaderState, 
  LoaderContextType, 
  LoaderProviderProps, 
  LoaderMetadata, 
  LoaderUtility, 
  LoaderStats 
}; 