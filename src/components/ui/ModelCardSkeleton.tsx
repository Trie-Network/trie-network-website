

import { Skeleton } from './Skeleton';


interface ModelCardSkeletonProps {
  className?: string;
  showCategories?: boolean;
  showStats?: boolean;
}

interface ImageSkeletonProps {
  className?: string;
}

interface CreatorInfoSkeletonProps {
  className?: string;
}

interface CategoriesSkeletonProps {
  className?: string;
}

interface DescriptionSkeletonProps {
  className?: string;
}

interface StatsSkeletonProps {
  className?: string;
}


const MODEL_CARD_SKELETON_CLASSES = {
  container: 'bg-white rounded-xl border border-[#e1e3e5] overflow-hidden flex flex-col h-[420px]',
  content: 'p-5 flex-1 flex flex-col',
  creatorContainer: 'flex items-center gap-2 mb-4',
  creatorAvatar: 'w-6 h-6',
  creatorInfo: 'flex-1',
  creatorName: 'w-3/4 h-4 mb-1',
  creatorService: 'w-1/2 h-3',
  categoriesContainer: 'flex gap-2 mb-4',
  category1: 'w-20 h-5',
  category2: 'w-24 h-5',
  descriptionContainer: 'space-y-2 mb-4',
  descriptionLine1: 'w-full h-4',
  descriptionLine2: 'w-5/6 h-4',
  statsContainer: 'mt-auto pt-4 border-t border-gray-100 flex items-center justify-between',
  statsLeft: 'flex items-center gap-4',
  stat1: 'w-16 h-4',
  stat2: 'w-12 h-4',
  stat3: 'w-24 h-4'
} as const;

const MODEL_CARD_SKELETON_DEFAULT_CONFIG = {
  defaultClassName: '',
  defaultShowCategories: true,
  defaultShowStats: true,
  defaultHeight: 'h-[420px]',
  imageHeight: 'h-[200px]'
} as const;


const modelCardSkeletonUtils = {
  
  getContainerClasses: (className: string): string => {
    return `${MODEL_CARD_SKELETON_CLASSES.container} ${className}`.trim();
  },

  
  getContentClasses: (className: string): string => {
    return `${MODEL_CARD_SKELETON_CLASSES.content} ${className}`.trim();
  },

  
  getCreatorContainerClasses: (className: string): string => {
    return `${MODEL_CARD_SKELETON_CLASSES.creatorContainer} ${className}`.trim();
  },

  
  getCategoriesContainerClasses: (className: string): string => {
    return `${MODEL_CARD_SKELETON_CLASSES.categoriesContainer} ${className}`.trim();
  },

  
  getDescriptionContainerClasses: (className: string): string => {
    return `${MODEL_CARD_SKELETON_CLASSES.descriptionContainer} ${className}`.trim();
  },

  
  getStatsContainerClasses: (className: string): string => {
    return `${MODEL_CARD_SKELETON_CLASSES.statsContainer} ${className}`.trim();
  },

  
  validateProps: (props: ModelCardSkeletonProps): boolean => {
    return (
      (props.className === undefined || typeof props.className === 'string') &&
      (props.showCategories === undefined || typeof props.showCategories === 'boolean') &&
      (props.showStats === undefined || typeof props.showStats === 'boolean')
    );
  }
} as const;


const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ className = '' }) => (
  <Skeleton className={`w-full ${MODEL_CARD_SKELETON_DEFAULT_CONFIG.imageHeight} ${className}`} />
);

const CreatorInfoSkeleton: React.FC<CreatorInfoSkeletonProps> = ({ className = '' }) => (
  <div className={modelCardSkeletonUtils.getCreatorContainerClasses(className)}>
    <Skeleton variant="circular" className={MODEL_CARD_SKELETON_CLASSES.creatorAvatar} />
    <div className={MODEL_CARD_SKELETON_CLASSES.creatorInfo}>
      <Skeleton className={MODEL_CARD_SKELETON_CLASSES.creatorName} />
      <Skeleton className={MODEL_CARD_SKELETON_CLASSES.creatorService} />
    </div>
  </div>
);

const CategoriesSkeleton: React.FC<CategoriesSkeletonProps> = ({ className = '' }) => (
  <div className={modelCardSkeletonUtils.getCategoriesContainerClasses(className)}>
    <Skeleton className={MODEL_CARD_SKELETON_CLASSES.category1} />
    <Skeleton className={MODEL_CARD_SKELETON_CLASSES.category2} />
  </div>
);

const DescriptionSkeleton: React.FC<DescriptionSkeletonProps> = ({ className = '' }) => (
  <div className={modelCardSkeletonUtils.getDescriptionContainerClasses(className)}>
    <Skeleton className={MODEL_CARD_SKELETON_CLASSES.descriptionLine1} />
    <Skeleton className={MODEL_CARD_SKELETON_CLASSES.descriptionLine2} />
  </div>
);

const StatsSkeleton: React.FC<StatsSkeletonProps> = ({ className = '' }) => (
  <div className={modelCardSkeletonUtils.getStatsContainerClasses(className)}>
    <div className={MODEL_CARD_SKELETON_CLASSES.statsLeft}>
      <Skeleton className={MODEL_CARD_SKELETON_CLASSES.stat1} />
      <Skeleton className={MODEL_CARD_SKELETON_CLASSES.stat2} />
    </div>
    <Skeleton className={MODEL_CARD_SKELETON_CLASSES.stat3} />
  </div>
);


export function ModelCardSkeleton({ 
  className = MODEL_CARD_SKELETON_DEFAULT_CONFIG.defaultClassName,
  showCategories = MODEL_CARD_SKELETON_DEFAULT_CONFIG.defaultShowCategories,
  showStats = MODEL_CARD_SKELETON_DEFAULT_CONFIG.defaultShowStats
}: ModelCardSkeletonProps) {
  
  if (!modelCardSkeletonUtils.validateProps({ className, showCategories, showStats })) {
   
    return null;
  }

  return (
    <div className={modelCardSkeletonUtils.getContainerClasses(className)}>
      <ImageSkeleton />
      
      <div className={modelCardSkeletonUtils.getContentClasses('')}>
        <CreatorInfoSkeleton />
        
        {showCategories && <CategoriesSkeleton />}
        
        <DescriptionSkeleton />
        
        {showStats && <StatsSkeleton />}
      </div>
    </div>
  );
}


export type { 
  ModelCardSkeletonProps, 
  ImageSkeletonProps, 
  CreatorInfoSkeletonProps, 
  CategoriesSkeletonProps, 
  DescriptionSkeletonProps, 
  StatsSkeletonProps 
};


export { 
  MODEL_CARD_SKELETON_CLASSES, 
  MODEL_CARD_SKELETON_DEFAULT_CONFIG, 
  modelCardSkeletonUtils 
};