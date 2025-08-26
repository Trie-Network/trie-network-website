

import { Skeleton } from './Skeleton';


interface SkeletonProps {
  className?: string;
}

interface FileItemSkeletonProps {
  index: number;
}

interface MetricCardSkeletonProps {
  index: number;
}

interface ExampleItemSkeletonProps {
  index: number;
}

interface OverviewSkeletonProps extends SkeletonProps {}
interface FilesSkeletonProps extends SkeletonProps {}
interface UsageGuideSkeletonProps extends SkeletonProps {}
interface MetricsSkeletonProps extends SkeletonProps {}
interface DiscussionsSkeletonProps extends SkeletonProps {}


const TAB_SKELETON_LAYOUT_CLASSES = {
  container: 'bg-white rounded-xl border border-[#e1e3e5]',
  containerPadded: 'bg-white rounded-xl border border-[#e1e3e5] p-6',
  containerOverflow: 'bg-white rounded-xl border border-[#e1e3e5] overflow-hidden',
  header: 'px-6 py-4 border-b border-[#e1e3e5]',
  divider: 'divide-y divide-[#e1e3e5]',
  fileItem: 'px-6 py-4 flex items-center justify-between',
  fileInfo: 'flex items-center gap-3',
  fileDetails: 'flex items-center gap-3',
  fileIcon: 'w-10 h-10 rounded-lg',
  fileText: 'w-32 h-4 mb-1',
  fileMeta: 'w-48 h-3',
  fileAction: 'w-24 h-8 rounded-lg',
  section: 'space-y-6',
  sectionCard: 'bg-white rounded-xl border border-[#e1e3e5] p-6',
  sectionTitle: 'w-32 h-6 mb-4',
  sectionTitleLarge: 'w-48 h-6 mb-6',
  contentText: 'space-y-4',
  contentLine: 'w-full h-4',
  contentLineMedium: 'w-5/6 h-4',
  contentLineSmall: 'w-4/6 h-4',
  contentLineShorter: 'w-3/4 h-4',
  codeBlock: 'w-full h-12 rounded-lg',
  codeBlockLarge: 'w-full h-24 rounded-lg',
  examplesContainer: 'space-y-6',
  exampleItem: 'space-y-2',
  exampleTitle: 'w-48 h-5 mb-2',
  exampleText: 'w-full h-4 mb-3',
  metricsGrid: 'grid grid-cols-2 gap-6',
  metricCard: 'bg-gray-50 rounded-lg p-4',
  metricLabel: 'w-24 h-4 mb-1',
  metricValue: 'w-16 h-8',
  discussionsCenter: 'text-center py-8',
  discussionsIcon: 'w-12 h-12 rounded-full mx-auto mb-4',
  discussionsTitle: 'w-48 h-6 mx-auto mb-2',
  discussionsText: 'w-64 h-4 mx-auto mb-4',
  discussionsButton: 'w-32 h-10 rounded-lg mx-auto'
} as const;

const SKELETON_CONFIG = {
  filesCount: 3,
  metricsCount: 4,
  examplesCount: 2
} as const;


const tabSkeletonUtils = {
  
  createSkeletonArray: (count: number): number[] => {
    return Array.from({ length: count }, (_, i) => i);
  },

  
  getLayoutClass: (type: keyof typeof TAB_SKELETON_LAYOUT_CLASSES): string => {
    return TAB_SKELETON_LAYOUT_CLASSES[type];
  },

  
  validateProps: (props: SkeletonProps): boolean => {
    return props.className === undefined || typeof props.className === 'string';
  }
} as const;


const FileItemSkeleton: React.FC<FileItemSkeletonProps> = ({ index }) => (
  <div key={index} className={TAB_SKELETON_LAYOUT_CLASSES.fileItem}>
    <div className={TAB_SKELETON_LAYOUT_CLASSES.fileInfo}>
      <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.fileIcon} />
      <div>
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.fileText} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.fileMeta} />
      </div>
    </div>
    <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.fileAction} />
  </div>
);

const MetricCardSkeleton: React.FC<MetricCardSkeletonProps> = ({ index }) => (
  <div key={index} className={TAB_SKELETON_LAYOUT_CLASSES.metricCard}>
    <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.metricLabel} />
    <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.metricValue} />
  </div>
);

const ExampleItemSkeleton: React.FC<ExampleItemSkeletonProps> = ({ index }) => (
  <div key={index}>
    <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.exampleTitle} />
    <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.exampleText} />
    <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.codeBlock} />
  </div>
);


export function OverviewSkeleton({ className }: OverviewSkeletonProps) {
  if (!tabSkeletonUtils.validateProps({ className })) {
    
    return null;
  }

  return (
    <div className={`${TAB_SKELETON_LAYOUT_CLASSES.containerPadded} ${className || ''}`}>
      <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.sectionTitle} />
      <div className={TAB_SKELETON_LAYOUT_CLASSES.contentText}>
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.contentLine} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.contentLineMedium} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.contentLineSmall} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.contentLine} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.contentLineShorter} />
      </div>
    </div>
  );
}


export function FilesSkeleton({ className }: FilesSkeletonProps) {
  if (!tabSkeletonUtils.validateProps({ className })) {
    
    return null;
  }

  return (
    <div className={`${TAB_SKELETON_LAYOUT_CLASSES.containerOverflow} ${className || ''}`}>
      <div className={TAB_SKELETON_LAYOUT_CLASSES.header}>
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.sectionTitle} />
      </div>
      <div className={TAB_SKELETON_LAYOUT_CLASSES.divider}>
        {tabSkeletonUtils.createSkeletonArray(SKELETON_CONFIG.filesCount).map((index) => (
          <FileItemSkeleton key={index} index={index} />
        ))}
      </div>
    </div>
  );
}


export function UsageGuideSkeleton({ className }: UsageGuideSkeletonProps) {
  if (!tabSkeletonUtils.validateProps({ className })) {

    return null;
  }

  return (
    <div className={`${TAB_SKELETON_LAYOUT_CLASSES.section} ${className || ''}`}>
      
      <div className={TAB_SKELETON_LAYOUT_CLASSES.sectionCard}>
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.sectionTitle} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.codeBlock} />
      </div>

      <div className={TAB_SKELETON_LAYOUT_CLASSES.sectionCard}>
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.sectionTitle} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.codeBlockLarge} />
      </div>

      
      <div className={TAB_SKELETON_LAYOUT_CLASSES.sectionCard}>
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.sectionTitleLarge} />
        <div className={TAB_SKELETON_LAYOUT_CLASSES.examplesContainer}>
          {tabSkeletonUtils.createSkeletonArray(SKELETON_CONFIG.examplesCount).map((index) => (
            <ExampleItemSkeleton key={index} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}


export function MetricsSkeleton({ className }: MetricsSkeletonProps) {
  if (!tabSkeletonUtils.validateProps({ className })) {
    
    return null;
  }

  return (
    <div className={`${TAB_SKELETON_LAYOUT_CLASSES.containerPadded} ${className || ''}`}>
      <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.sectionTitleLarge} />
      <div className={TAB_SKELETON_LAYOUT_CLASSES.metricsGrid}>
        {tabSkeletonUtils.createSkeletonArray(SKELETON_CONFIG.metricsCount).map((index) => (
          <MetricCardSkeleton key={index} index={index} />
        ))}
      </div>
    </div>
  );
}


export function DiscussionsSkeleton({ className }: DiscussionsSkeletonProps) {
  if (!tabSkeletonUtils.validateProps({ className })) {
   
    return null;
  }

  return (
    <div className={`${TAB_SKELETON_LAYOUT_CLASSES.containerPadded} ${className || ''}`}>
      <div className={TAB_SKELETON_LAYOUT_CLASSES.discussionsCenter}>
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.discussionsIcon} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.discussionsTitle} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.discussionsText} />
        <Skeleton className={TAB_SKELETON_LAYOUT_CLASSES.discussionsButton} />
      </div>
    </div>
  );
}


export type { 
  SkeletonProps,
  OverviewSkeletonProps, 
  FilesSkeletonProps, 
  UsageGuideSkeletonProps, 
  MetricsSkeletonProps,
  DiscussionsSkeletonProps,
  FileItemSkeletonProps,
  MetricCardSkeletonProps,
  ExampleItemSkeletonProps
};


export { TAB_SKELETON_LAYOUT_CLASSES, SKELETON_CONFIG, tabSkeletonUtils };