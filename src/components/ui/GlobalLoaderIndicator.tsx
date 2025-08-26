

import { useGlobalLoaders } from '@/hooks/useGlobalLoaders';

interface GlobalLoaderIndicatorProps {
  show?: boolean;
}

interface LoaderItemProps {
  isActive: boolean;
  label: string;
}

interface LoaderItemsContainerProps {
  loaders: Array<{ isActive: boolean; label: string }>;
}


const GLOBAL_LOADER_LAYOUT_CLASSES = {
  container: 'fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs',
  title: 'font-semibold mb-2',
  itemsContainer: 'space-y-1',
  item: 'flex items-center gap-2',
  activeItem: 'text-yellow-400',
  inactiveItem: 'text-gray-400',
  indicator: 'w-2 h-2 rounded-full',
  activeIndicator: 'bg-yellow-400 animate-pulse',
  inactiveIndicator: 'bg-gray-400'
} as const;

const GLOBAL_LOADER_DEFAULT_CONFIG = {
  defaultShow: false,
  zIndex: 50
} as const;

const ANIMATION_CONFIG = {
  pulse: 'animate-pulse'
} as const;


const globalLoaderUtils = {
  
  isAnyLoaderActive: (loaders: Array<{ isActive: boolean }>): boolean => {
    return loaders.some(loader => loader.isActive);
  },

  
  getItemClasses: (isActive: boolean): string => {
    const baseClasses = GLOBAL_LOADER_LAYOUT_CLASSES.item;
    const stateClasses = isActive 
      ? GLOBAL_LOADER_LAYOUT_CLASSES.activeItem 
      : GLOBAL_LOADER_LAYOUT_CLASSES.inactiveItem;
    
    return `${baseClasses} ${stateClasses}`;
  },

  
  getIndicatorClasses: (isActive: boolean): string => {
    const baseClasses = GLOBAL_LOADER_LAYOUT_CLASSES.indicator;
    const stateClasses = isActive 
      ? GLOBAL_LOADER_LAYOUT_CLASSES.activeIndicator 
      : GLOBAL_LOADER_LAYOUT_CLASSES.inactiveIndicator;
    
    return `${baseClasses} ${stateClasses}`;
  },

  
  getStatusText: (isActive: boolean): string => {
    return isActive ? 'Active' : 'Inactive';
  },

  
  validateProps: (props: GlobalLoaderIndicatorProps): boolean => {
    return props.show === undefined || typeof props.show === 'boolean';
  },

  
  createLoaderItems: (loaders: ReturnType<typeof useGlobalLoaders>): Array<{ isActive: boolean; label: string }> => {
    return [
      { isActive: loaders.isUploadingModel, label: 'Upload Model' },
      { isActive: loaders.isUploadingDataset, label: 'Upload Dataset' },
      { isActive: loaders.isBuyingAsset, label: 'Buying Asset' },
      { isActive: loaders.isDownloadingAsset, label: 'Downloading Asset' },
      { isActive: loaders.isBuyingTokens, label: 'Buying Tokens' }
    ];
  }
} as const;


const LoaderItem: React.FC<LoaderItemProps> = ({ isActive, label }) => (
  <div className={globalLoaderUtils.getItemClasses(isActive)}>
    <div className={globalLoaderUtils.getIndicatorClasses(isActive)}></div>
    {label}: {globalLoaderUtils.getStatusText(isActive)}
  </div>
);

const LoaderItemsContainer: React.FC<LoaderItemsContainerProps> = ({ loaders }) => (
  <div className={GLOBAL_LOADER_LAYOUT_CLASSES.itemsContainer}>
    {loaders.map((loader, index) => (
      <LoaderItem 
        key={`${loader.label}-${index}`}
        isActive={loader.isActive} 
        label={loader.label} 
      />
    ))}
  </div>
);


export function GlobalLoaderIndicator({ 
  show = GLOBAL_LOADER_DEFAULT_CONFIG.defaultShow 
}: GlobalLoaderIndicatorProps) {
  const loaders = useGlobalLoaders();
  
  
  if (!globalLoaderUtils.validateProps({ show })) {
    // GlobalLoaderIndicator: Invalid props provided
    return null;
  }

  const loaderItems = globalLoaderUtils.createLoaderItems(loaders);
  const isAnyActive = globalLoaderUtils.isAnyLoaderActive(loaderItems);

  
  if (!show && !isAnyActive) {
    return null;
  }

  return (
    <div className={GLOBAL_LOADER_LAYOUT_CLASSES.container}>
      <div className={GLOBAL_LOADER_LAYOUT_CLASSES.title}>
        Global Loaders:
      </div>
      <LoaderItemsContainer loaders={loaderItems} />
    </div>
  );
}


export type { 
  GlobalLoaderIndicatorProps,
  LoaderItemProps,
  LoaderItemsContainerProps
};


export { GLOBAL_LOADER_LAYOUT_CLASSES, GLOBAL_LOADER_DEFAULT_CONFIG, ANIMATION_CONFIG, globalLoaderUtils }; 