

import { Skeleton } from './Skeleton';


interface FilterSkeletonProps {
  itemCount?: number;
}

interface FilterItemSkeletonProps {
  index: number;
}

interface FilterHeaderSkeletonProps {}

interface FilterItemsContainerProps {
  itemCount: number;
}


const FILTER_SKELETON_LAYOUT_CLASSES = {
  container: 'bg-white rounded-xl shadow-sm border border-[#e1e3e5] p-6',
  header: 'mb-4',
  headerSkeleton: 'w-32 h-6',
  itemsContainer: 'space-y-2',
  itemSkeleton: 'w-full h-10 rounded-lg'
} as const;

const FILTER_SKELETON_DEFAULT_CONFIG = {
  defaultItemCount: 4,
  minItemCount: 1,
  maxItemCount: 20
} as const;

const FILTER_SKELETON_ANIMATION_CONFIG = {
  staggerDelay: 0.1
} as const;


const filterSkeletonUtils = {
  
  createSkeletonArray: (count: number): number[] => {
    return Array.from({ length: count }, (_, i) => i);
  },

  
  validateItemCount: (itemCount: number): boolean => {
    return (
      Number.isInteger(itemCount) &&
      itemCount >= FILTER_SKELETON_DEFAULT_CONFIG.minItemCount &&
      itemCount <= FILTER_SKELETON_DEFAULT_CONFIG.maxItemCount
    );
  },

  
  getValidatedItemCount: (itemCount?: number): number => {
    if (itemCount === undefined) {
      return FILTER_SKELETON_DEFAULT_CONFIG.defaultItemCount;
    }
    
    if (!filterSkeletonUtils.validateItemCount(itemCount)) {
    
      return FILTER_SKELETON_DEFAULT_CONFIG.defaultItemCount;
    }
    
    return itemCount;
  },

  
  validateProps: (props: FilterSkeletonProps): boolean => {
    return (
      props.itemCount === undefined || 
      (typeof props.itemCount === 'number' && filterSkeletonUtils.validateItemCount(props.itemCount))
    );
  },

  
  getLayoutClass: (type: keyof typeof FILTER_SKELETON_LAYOUT_CLASSES): string => {
    return FILTER_SKELETON_LAYOUT_CLASSES[type];
  }
} as const;


const FilterHeaderSkeleton: React.FC<FilterHeaderSkeletonProps> = () => (
  <div className={FILTER_SKELETON_LAYOUT_CLASSES.header}>
    <Skeleton className={FILTER_SKELETON_LAYOUT_CLASSES.headerSkeleton} />
  </div>
);

const FilterItemSkeleton: React.FC<FilterItemSkeletonProps> = ({ index }) => (
  <Skeleton 
    key={index} 
    className={FILTER_SKELETON_LAYOUT_CLASSES.itemSkeleton} 
  />
);

const FilterItemsContainer: React.FC<FilterItemsContainerProps> = ({ itemCount }) => {
  const validatedItemCount = filterSkeletonUtils.getValidatedItemCount(itemCount);
  const skeletonItems = filterSkeletonUtils.createSkeletonArray(validatedItemCount);

  return (
    <div className={FILTER_SKELETON_LAYOUT_CLASSES.itemsContainer}>
      {skeletonItems.map((index) => (
        <FilterItemSkeleton key={index} index={index} />
      ))}
    </div>
  );
};


export function FilterSkeleton({ 
  itemCount = FILTER_SKELETON_DEFAULT_CONFIG.defaultItemCount 
}: FilterSkeletonProps) {
  
  if (!filterSkeletonUtils.validateProps({ itemCount })) {
 
    return null;
  }

  const validatedItemCount = filterSkeletonUtils.getValidatedItemCount(itemCount);

  return (
    <div className={FILTER_SKELETON_LAYOUT_CLASSES.container}>
      <FilterHeaderSkeleton />
      <FilterItemsContainer itemCount={validatedItemCount} />
    </div>
  );
}


export type { 
  FilterSkeletonProps,
  FilterItemSkeletonProps,
  FilterHeaderSkeletonProps,
  FilterItemsContainerProps
};


export { FILTER_SKELETON_LAYOUT_CLASSES, FILTER_SKELETON_DEFAULT_CONFIG, FILTER_SKELETON_ANIMATION_CONFIG, filterSkeletonUtils };