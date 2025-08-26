

import React from 'react';
import { Skeleton } from './Skeleton';

interface TrendingItemSkeletonProps {
  className?: string;
}

interface TrendingItemContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface TrendingItemContentProps {
  children: React.ReactNode;
  className?: string;
}

interface TrendingItemIconProps {
  className?: string;
}

interface TrendingItemTextProps {
  children: React.ReactNode;
  className?: string;
}

interface TrendingItemMetadataProps {
  children: React.ReactNode;
  className?: string;
}

interface TrendingItemActionsProps {
  children: React.ReactNode;
  className?: string;
}

const TRENDING_ITEM_SKELETON_CLASSES = {
  container: 'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-white rounded-lg border border-[#e1e3e5]',
  content: 'flex items-center gap-3 w-full',
  icon: 'w-8 h-8 rounded-lg',
  textContainer: 'flex-1 min-w-0',
  title: 'w-48 h-4 mb-2',
  metadata: 'flex items-center gap-2',
  metadataItem: 'w-24 h-3',
  separator: 'w-2 h-2 rounded-full',
  metadataItemLong: 'w-32 h-3',
  actions: 'flex items-center gap-4 text-sm text-gray-600 w-full sm:w-auto justify-between mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0',
  actionItem: 'w-16 h-4',
  actionButton: 'w-16 h-8 rounded-full'
} as const;

const TRENDING_ITEM_SKELETON_DEFAULT_CONFIG = {
  defaultClassName: ''
} as const;

const TRENDING_ITEM_SKELETON_LAYOUT_CONFIG = {
  responsiveBreakpoint: 'sm',
  gapSizes: {
    mobile: 'gap-3',
    desktop: 'gap-4'
  },
  spacing: {
    mobile: 'mt-2 pt-2',
    desktop: 'sm:mt-0 sm:pt-0'
  }
} as const;

const trendingItemSkeletonUtils = {
  getContainerClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.container} ${className}`.trim();
  },

  getContentClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.content} ${className}`.trim();
  },

  getIconClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.icon} ${className}`.trim();
  },

  getTextContainerClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.textContainer} ${className}`.trim();
  },

  getTitleClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.title} ${className}`.trim();
  },

  getMetadataClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.metadata} ${className}`.trim();
  },

  getMetadataItemClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.metadataItem} ${className}`.trim();
  },

  getSeparatorClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.separator} ${className}`.trim();
  },

  getMetadataItemLongClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.metadataItemLong} ${className}`.trim();
  },

  getActionsClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.actions} ${className}`.trim();
  },


  getActionItemClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.actionItem} ${className}`.trim();
  },


  getActionButtonClasses: (className: string): string => {
    return `${TRENDING_ITEM_SKELETON_CLASSES.actionButton} ${className}`.trim();
  },


  validateProps: (props: TrendingItemSkeletonProps): boolean => {
    return (
      (props.className === undefined || typeof props.className === 'string')
    );
  },


  getDefaultClassName: (className?: string): string => {
    return className || TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName;
  }
} as const;


const TrendingItemIcon: React.FC<TrendingItemIconProps> = ({ 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Skeleton className={trendingItemSkeletonUtils.getIconClasses(className)} />
);

const TrendingItemText: React.FC<TrendingItemTextProps> = ({ 
  children, 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={trendingItemSkeletonUtils.getTextContainerClasses(className)}>
    {children}
  </div>
);

const TrendingItemTitle: React.FC<{ className?: string }> = ({ 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Skeleton className={trendingItemSkeletonUtils.getTitleClasses(className)} />
);

const TrendingItemMetadata: React.FC<TrendingItemMetadataProps> = ({ 
  children, 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={trendingItemSkeletonUtils.getMetadataClasses(className)}>
    {children}
  </div>
);

const TrendingItemMetadataItem: React.FC<{ className?: string }> = ({ 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Skeleton className={trendingItemSkeletonUtils.getMetadataItemClasses(className)} />
);

const TrendingItemSeparator: React.FC<{ className?: string }> = ({ 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Skeleton className={trendingItemSkeletonUtils.getSeparatorClasses(className)} />
);

const TrendingItemMetadataItemLong: React.FC<{ className?: string }> = ({ 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Skeleton className={trendingItemSkeletonUtils.getMetadataItemLongClasses(className)} />
);

const TrendingItemActions: React.FC<TrendingItemActionsProps> = ({ 
  children, 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={trendingItemSkeletonUtils.getActionsClasses(className)}>
    {children}
  </div>
);

const TrendingItemActionItem: React.FC<{ className?: string }> = ({ 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Skeleton className={trendingItemSkeletonUtils.getActionItemClasses(className)} />
);

const TrendingItemActionButton: React.FC<{ className?: string }> = ({ 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Skeleton className={trendingItemSkeletonUtils.getActionButtonClasses(className)} />
);

const TrendingItemContainer: React.FC<TrendingItemContainerProps> = ({ 
  children, 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={trendingItemSkeletonUtils.getContainerClasses(className)}>
    {children}
  </div>
);

const TrendingItemContent: React.FC<TrendingItemContentProps> = ({ 
  children, 
  className = TRENDING_ITEM_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={trendingItemSkeletonUtils.getContentClasses(className)}>
    {children}
  </div>
);


export function TrendingItemSkeleton({ 
  className 
}: TrendingItemSkeletonProps) {

  if (!trendingItemSkeletonUtils.validateProps({ className })) {
   
    return null;
  }


  const defaultClassName = trendingItemSkeletonUtils.getDefaultClassName(className);

  return (
    <TrendingItemContainer className={defaultClassName}>
      <TrendingItemContent>
        <TrendingItemIcon />
        <TrendingItemText>
          <TrendingItemTitle />
          <TrendingItemMetadata>
            <TrendingItemMetadataItem />
            <TrendingItemSeparator />
            <TrendingItemMetadataItemLong />
          </TrendingItemMetadata>
        </TrendingItemText>
      </TrendingItemContent>
      <TrendingItemActions>
        <TrendingItemActionItem />
        <TrendingItemActionButton />
      </TrendingItemActions>
    </TrendingItemContainer>
  );
}

export default TrendingItemSkeleton;


export type { 
  TrendingItemSkeletonProps, 
  TrendingItemContainerProps, 
  TrendingItemContentProps, 
  TrendingItemIconProps, 
  TrendingItemTextProps, 
  TrendingItemMetadataProps, 
  TrendingItemActionsProps 
};

  
export { 
  TRENDING_ITEM_SKELETON_CLASSES, 
  TRENDING_ITEM_SKELETON_DEFAULT_CONFIG, 
  TRENDING_ITEM_SKELETON_LAYOUT_CONFIG, 
  trendingItemSkeletonUtils 
};