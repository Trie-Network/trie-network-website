
import { Skeleton } from './Skeleton';


interface DetailViewSkeletonProps {
  showHeroSection?: boolean;
  showQuickStats?: boolean;
  showTags?: boolean;
  showMainContent?: boolean;
  showSidebar?: boolean;
  showPreview?: boolean;
  showQuickActions?: boolean;
  showCreatorInfo?: boolean;
}

interface HeroSectionProps {
  showQuickStats?: boolean;
  showTags?: boolean;
}

interface MainContentProps {
  showContent?: boolean;
}

interface SidebarProps {
  showPreview?: boolean;
  showQuickActions?: boolean;
  showCreatorInfo?: boolean;
}

interface QuickActionsProps {
  actionCount?: number;
}

interface CreatorInfoProps {
  showDescription?: boolean;
}


const SKELETON_LAYOUT_CLASSES = {
  container: 'min-h-[calc(100vh-112px)] bg-[#f6f6f7]',
  heroSection: 'bg-white border-b border-[#e1e3e5] mt-6',
  heroContent: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  heroHeader: 'flex items-center gap-4 mb-6',
  heroTitle: 'flex items-center gap-3 mb-2',
  heroMetadata: 'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3',
  heroMetadataItem: 'flex items-center gap-2',
  quickStats: 'flex items-center gap-6',
  tags: 'flex items-center gap-2 mt-6',
  contentSection: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  contentGrid: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
  mainContent: 'lg:col-span-2 space-y-8',
  contentCard: 'bg-white rounded-xl border border-[#e1e3e5] p-6',
  contentTitle: 'w-32 h-6 mb-4',
  contentText: 'space-y-4',
  sidebar: 'space-y-6',
  sidebarCard: 'bg-white rounded-xl border border-[#e1e3e5]',
  sidebarCardPadded: 'bg-white rounded-xl border border-[#e1e3e5] p-6',
  preview: 'w-full h-48',
  quickActions: 'w-full h-10 rounded-lg',
  quickActionsDivider: 'mt-4 pt-4 border-t border-gray-100',
  quickActionsItem: 'flex items-center gap-2',
  creatorInfo: 'flex items-center gap-3 mb-3',
  creatorAvatar: 'w-10 h-10 rounded-full',
  creatorDetails: 'flex items-center gap-3 mb-3',
  creatorName: 'w-32 h-4 mb-1',
  creatorMeta: 'w-24 h-3',
  creatorDescription: 'w-full h-16'
} as const;

const SKELETON_SIZES = {
  title: 'w-64 h-8',
  badge: 'w-20 h-6 rounded-full',
  avatar: 'w-6 h-6 rounded-full',
  metadata: 'w-32 h-4',
  metadataSmall: 'w-24 h-4',
  stats: 'w-24 h-6',
  tag: 'w-20 h-6 rounded-full',
  tagMedium: 'w-24 h-6 rounded-full',
  tagSmall: 'w-16 h-6 rounded-full',
  contentLine: 'w-full h-4',
  contentLineMedium: 'w-5/6 h-4',
  contentLineSmall: 'w-4/6 h-4',
  actionItem: 'w-32 h-4',
  actionIcon: 'w-4 h-4',
  creatorTitle: 'w-32 h-4 mb-4',
  creatorAvatar: 'w-10 h-10 rounded-full',
  creatorName: 'w-32 h-4 mb-1',
  creatorMeta: 'w-24 h-3'
} as const;

const DEFAULT_CONFIG = {
  actionCount: 4,
  showHeroSection: true,
  showQuickStats: true,
  showTags: true,
  showMainContent: true,
  showSidebar: true,
  showPreview: true,
  showQuickActions: true,
  showCreatorInfo: true,
  showDescription: true
} as const;


const skeletonUtils = {
 
  createSkeletonArray: (count: number): number[] => {
    return Array.from({ length: count }, (_, i) => i);
  },


  getSkeletonSize: (type: keyof typeof SKELETON_SIZES): string => {
    return SKELETON_SIZES[type];
  },


  getLayoutClass: (type: keyof typeof SKELETON_LAYOUT_CLASSES): string => {
    return SKELETON_LAYOUT_CLASSES[type];
  },


  validateConfig: (config: Partial<DetailViewSkeletonProps>): boolean => {
    return Object.values(config).every(value => 
      value === undefined || typeof value === 'boolean'
    );
  }
} as const;


const HeroSection: React.FC<HeroSectionProps> = ({ showQuickStats = true, showTags = true }) => (
  <div className={SKELETON_LAYOUT_CLASSES.heroSection}>
    <div className={SKELETON_LAYOUT_CLASSES.heroContent}>
      <div className={SKELETON_LAYOUT_CLASSES.heroHeader}>
        <div>
          <div className={SKELETON_LAYOUT_CLASSES.heroTitle}>
            <Skeleton className={SKELETON_SIZES.title} />
            <Skeleton className={SKELETON_SIZES.badge} />
          </div>
          <div className={SKELETON_LAYOUT_CLASSES.heroMetadata}>
            <div className={SKELETON_LAYOUT_CLASSES.heroMetadataItem}>
              <Skeleton className={SKELETON_SIZES.avatar} />
              <Skeleton className={SKELETON_SIZES.metadata} />
            </div>
            <div className={SKELETON_LAYOUT_CLASSES.heroMetadataItem}>
              <Skeleton className={SKELETON_SIZES.metadataSmall} />
              <Skeleton className={SKELETON_SIZES.metadata} />
            </div>
          </div>
        </div>
      </div>

      {showQuickStats && (
        <div className={SKELETON_LAYOUT_CLASSES.quickStats}>
          <Skeleton className={SKELETON_SIZES.stats} />
          <Skeleton className={SKELETON_SIZES.stats} />
          <Skeleton className={SKELETON_SIZES.stats} />
        </div>
      )}

      {showTags && (
        <div className={SKELETON_LAYOUT_CLASSES.tags}>
          <Skeleton className={SKELETON_SIZES.tag} />
          <Skeleton className={SKELETON_SIZES.tagMedium} />
          <Skeleton className={SKELETON_SIZES.tagSmall} />
        </div>
      )}
    </div>
  </div>
);

const MainContent: React.FC<MainContentProps> = ({ showContent = true }) => (
  <div className={SKELETON_LAYOUT_CLASSES.mainContent}>
    {showContent && (
      <div className={SKELETON_LAYOUT_CLASSES.contentCard}>
        <Skeleton className={SKELETON_LAYOUT_CLASSES.contentTitle} />
        <div className={SKELETON_LAYOUT_CLASSES.contentText}>
          <Skeleton className={SKELETON_SIZES.contentLine} />
          <Skeleton className={SKELETON_SIZES.contentLineMedium} />
          <Skeleton className={SKELETON_SIZES.contentLineSmall} />
        </div>
      </div>
    )}
  </div>
);

const QuickActions: React.FC<QuickActionsProps> = ({ actionCount = DEFAULT_CONFIG.actionCount }) => (
  <div className={SKELETON_LAYOUT_CLASSES.sidebarCardPadded}>
    <Skeleton className={SKELETON_LAYOUT_CLASSES.quickActions} />
    <Skeleton className={SKELETON_LAYOUT_CLASSES.quickActions} />
    
    <div className={SKELETON_LAYOUT_CLASSES.quickActionsDivider}>
      <Skeleton className={SKELETON_SIZES.creatorTitle} />
      <div className="space-y-3">
        {skeletonUtils.createSkeletonArray(actionCount).map((i) => (
          <div key={i} className={SKELETON_LAYOUT_CLASSES.quickActionsItem}>
            <Skeleton className={SKELETON_SIZES.actionIcon} />
            <Skeleton className={SKELETON_SIZES.actionItem} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CreatorInfo: React.FC<CreatorInfoProps> = ({ showDescription = true }) => (
  <div className={SKELETON_LAYOUT_CLASSES.sidebarCardPadded}>
    <Skeleton className={SKELETON_SIZES.creatorTitle} />
    <div className={SKELETON_LAYOUT_CLASSES.creatorDetails}>
      <Skeleton className={SKELETON_SIZES.creatorAvatar} />
      <div>
        <Skeleton className={SKELETON_SIZES.creatorName} />
        <Skeleton className={SKELETON_SIZES.creatorMeta} />
      </div>
    </div>
    {showDescription && (
      <Skeleton className={SKELETON_LAYOUT_CLASSES.creatorDescription} />
    )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  showPreview = true, 
  showQuickActions = true, 
  showCreatorInfo = true 
}) => (
  <div className={SKELETON_LAYOUT_CLASSES.sidebar}>
    {showPreview && (
      <div className={SKELETON_LAYOUT_CLASSES.sidebarCard}>
        <Skeleton className={SKELETON_LAYOUT_CLASSES.preview} />
      </div>
    )}

    {showQuickActions && <QuickActions />}

    {showCreatorInfo && <CreatorInfo />}
  </div>
);


export function DetailViewSkeleton({
  showHeroSection = DEFAULT_CONFIG.showHeroSection,
  showQuickStats = DEFAULT_CONFIG.showQuickStats,
  showTags = DEFAULT_CONFIG.showTags,
  showMainContent = DEFAULT_CONFIG.showMainContent,
  showSidebar = DEFAULT_CONFIG.showSidebar,
  showPreview = DEFAULT_CONFIG.showPreview,
  showQuickActions = DEFAULT_CONFIG.showQuickActions,
  showCreatorInfo = DEFAULT_CONFIG.showCreatorInfo
}: DetailViewSkeletonProps) {
 
  if (!skeletonUtils.validateConfig({
    showHeroSection,
    showQuickStats,
    showTags,
    showMainContent,
    showSidebar,
    showPreview,
    showQuickActions,
    showCreatorInfo
  })) {
   
    return null;
  }

  return (
    <div className={SKELETON_LAYOUT_CLASSES.container}>
      {showHeroSection && (
        <HeroSection 
          showQuickStats={showQuickStats} 
          showTags={showTags} 
        />
      )}

      <div className={SKELETON_LAYOUT_CLASSES.contentSection}>
        <div className={SKELETON_LAYOUT_CLASSES.contentGrid}>
          {showMainContent && <MainContent />}
          
          {showSidebar && (
            <Sidebar 
              showPreview={showPreview}
              showQuickActions={showQuickActions}
              showCreatorInfo={showCreatorInfo}
            />
          )}
        </div>
      </div>
    </div>
  );
}


export type { 
  DetailViewSkeletonProps, 
  HeroSectionProps, 
  MainContentProps, 
  SidebarProps,
  QuickActionsProps,
  CreatorInfoProps
};


export { SKELETON_LAYOUT_CLASSES, SKELETON_SIZES, DEFAULT_CONFIG, skeletonUtils };