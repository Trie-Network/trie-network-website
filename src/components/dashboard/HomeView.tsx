import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import {
  EmptyState,
  TrendingItemSkeleton,
  Skeleton,
  InfoIcon
} from '@/components/ui';
import { useAuth } from '@/hooks';
import { getRelativeTimeString, sortByActivityCount, getActivitySummary } from '@/utils';
import { END_POINTS } from '@/api/requests';
import { getNetworkColor } from '../../config/colors';


interface CounterProps {
  value: number;
  duration?: number;
  label: string;
  tooltip?: string;
}

interface HomeViewProps {
  primaryColor?: string;
}

interface PlatformStatsProps {
  ModelMetrics: any;
  transactions: any;
  loader: boolean;
}

interface TrendingSectionProps {
  title: string;
  data: any[];
  loader: boolean;
  usageHistoryLoader: boolean;
  type: 'model' | 'dataset';
  navigate: (path: string, options?: any) => void;
}

interface TrendingItemProps {
  item: any;
  index: number;
  navigate: (path: string, options?: any) => void;
}

interface TrendingItemCardProps {
  item: any;
  index: number;
  onClick: () => void;
}

interface StatsCardProps {
  value: number;
  label: string;
  isLoading: boolean;
  tooltip?: string;
}

interface EmptyStateConfig {
  title: string;
  icon: string;
  action: {
    label: string;
    href: string;
  };
}


const LAYOUT_CLASSES = {
  container: 'grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-112px)] pt-6 pb-16 px-4 md:px-6 lg:px-8',
  mainContent: 'lg:col-span-3 h-[calc(100vh-112px)] overflow-y-auto pb-16 scrollbar-hide relative overflow-x-visible',
  statsSection: 'bg-white rounded-xl p-6 pt-12 mb-8 animate-fadeIn relative overflow-visible',
  statsTitle: 'text-xl font-bold text-gray-900 mb-4',
  statsGrid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
  statsCard: 'bg-white border border-gray-200 p-4 rounded-lg',
  trendingGrid: 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-8',
  trendingCard: 'bg-white rounded-xl p-6',
  trendingHeader: 'flex items-center gap-2 mb-4',
  trendingIcon: 'w-5 h-5 text-gray-600',
  trendingTitle: 'text-lg font-semibold text-gray-900',
  trendingSubtitle: 'text-sm text-gray-500',
  trendingList: 'space-y-3',
  trendingItem: 'flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-[#e1e3e5]',
  trendingAvatar: 'w-8 h-8 bg-gradient-to-br rounded-lg bg-gray-200 flex text-gray-900 items-center justify-center font-medium',
  trendingContent: 'flex-1 min-w-0',
  trendingName: 'text-sm font-medium text-gray-900 truncate',
  trendingTime: 'text-xs text-gray-500',
  seeMoreButton: 'inline-flex items-center px-3 py-1.5 border border-primary bg-transparent text-xs font-medium rounded-md cursor-pointer text-primary w-fit hover:bg-primary hover:text-white transition-colors',
  seeMoreContainer: 'text-gray-900 flex justify-start'
} as const;

const ANIMATION_CONFIG = {
  counterDuration: 2,
  counterEase: "easeOut"
} as const;

const TRENDING_CONFIG = {
  maxItems: 5,
  emptyStateConfigs: {
    model: {
      title: "No AI models available yet",
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12",
      action: {
        label: "Upload Model",
        href: "/dashboard/upload-model"
      }
    },
    dataset: {
      title: "No datasets available yet",
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12",
      action: {
        label: "Upload Dataset",
        href: "/dashboard/upload-dataset"
      }
    }
  }
} as const;

const STATS_LABELS = {
  aiModels: 'AI Models',
  datasets: 'Datasets',
  totalAssets: 'Total Assets',
  transactions: 'Transactions'
} as const;

const STATS_TOOLTIPS = {
  aiModels: 'AI models available for inference and training',
  datasets: 'Datasets available for training and research',
  totalAssets: 'Combined count of all platform assets',
  transactions: 'Total transactions processed on the platform'
} as const;

const NAVIGATION_PATHS = {
  models: '/dashboard/models',
  datasets: '/dashboard/datasets'
} as const;


const createSlug = (name: string): string => {
  return name?.replace(/\s+/g, '-')?.replace(/\//g, '-') || '';
};

const getNavigationPath = (item: any): string => {
  const slug = createSlug(item?.metadata?.name);
  return `/dashboard/model/${slug}`;
};

const getNavigationState = (item: any) => {
  return { state: { model: { ...item, type: item?.metadata?.type } } };
};

// Use the new trending utility for sorting by activity count
const sortByUsageHistory = sortByActivityCount;

const filterByType = (data: any[], type: string): any[] => {
  return data?.filter((item: any) =>
    item?.metadata?.type === type &&
    item?.usageHistory &&
    Array.isArray(item.usageHistory) &&
    item.usageHistory.length > 0
  ) || [];
};

const getLastUpdateTime = (item: any): string => {
  if (!item?.usageHistory?.length) return 'No activity';
  
  const lastEpoch = item.usageHistory[item.usageHistory.length - 1]?.Epoch;
  const lastUpdate = lastEpoch ? getRelativeTimeString(Number(lastEpoch)) : 'Unknown';
  const activitySummary = getActivitySummary(item.usageHistory);
  
  return `${activitySummary} • Last used ${lastUpdate}`;
};

const getInitials = (name: string): string => {
  return name?.charAt(0)?.toUpperCase() || '?';
};

const getItemIcon = (type: string): string => {
  if (type === 'model') {
    return 'M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 15h19.5m-16.5 0h13.5M9 3.75l2.25 4.5m0 0L15 3.75M11.25 8.25h4.5';
  } else if (type === 'dataset') {
    return 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125';
  }
  return 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25';
};


const Counter = ({ value, duration = ANIMATION_CONFIG.counterDuration, label, tooltip }: CounterProps) => {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration,
        onUpdate: (val) => setDisplayValue(Math.round(val)),
        ease: ANIMATION_CONFIG.counterEase
      });

      return () => controls.stop();
    }
  }, [isInView, value, duration]);

  return (
    <div
      ref={nodeRef}
      className="bg-white border border-gray-200 p-5 rounded-lg hover:shadow-md transition-all duration-300 group text-center"
      onMouseEnter={(e) => {
        const numberElement = e.currentTarget.querySelector('.stats-number');
        if (numberElement) {
          numberElement.style.color = getNetworkColor();
        }
      }}
      onMouseLeave={(e) => {
        const numberElement = e.currentTarget.querySelector('.stats-number');
        if (numberElement) {
          numberElement.style.color = '#111827';
        }
      }}
    >
      <motion.div
        className="text-2xl md:text-3xl font-bold text-gray-900 transition-colors stats-number"
      >
        {displayValue}
      </motion.div>
      <div className="text-sm text-gray-500 mt-2 flex items-center justify-center">
        <span>{label}</span>
        {tooltip && <InfoIcon tooltip={tooltip} />}
      </div>
    </div>
  );
};

const StatsCard = ({ value, label, isLoading, tooltip }: StatsCardProps) => {
  if (isLoading) {
    return (
      <div className={LAYOUT_CLASSES.statsCard}>
        <Skeleton className="w-24 h-8 mb-2" />
        <Skeleton className="w-16 h-4" />
      </div>
    );
  }

  return <Counter value={value} label={label} tooltip={tooltip} />;
};

const TrendingItemCard = ({ item, index, onClick, type }: TrendingItemCardProps & { type: string }) => (
  <div
    onClick={onClick}
    className={LAYOUT_CLASSES.trendingItem}
  >
    <div className={LAYOUT_CLASSES.trendingAvatar}>
      <svg
        className="w-4 h-4 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d={getItemIcon(type)}
        />
      </svg>
    </div>
    <div className={LAYOUT_CLASSES.trendingContent}>
      <h3 className={LAYOUT_CLASSES.trendingName}>
        {item?.metadata?.name}
      </h3>
      <div className={LAYOUT_CLASSES.trendingTime}>
        {getLastUpdateTime(item)}
      </div>
    </div>
  </div>
);

const TrendingItem = ({ item, index, navigate, type }: TrendingItemProps & { type: string }) => {
  const handleClick = () => {
    const path = getNavigationPath(item);
    const state = getNavigationState(item);
    navigate(path, state);
  };

  return (
    <TrendingItemCard
      item={item}
      index={index}
      onClick={handleClick}
      type={type}
    />
  );
};

const TrendingSection = ({ title, data, loader, usageHistoryLoader, type, navigate }: TrendingSectionProps) => {
  const isLoading = loader || usageHistoryLoader;
  const hasData = data?.length > 0;
  const displayData = data?.slice(0, TRENDING_CONFIG.maxItems) || [];
  const emptyStateConfig = TRENDING_CONFIG.emptyStateConfigs[type];

  return (
    <div className={LAYOUT_CLASSES.trendingCard}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className={LAYOUT_CLASSES.trendingIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h2 className={LAYOUT_CLASSES.trendingTitle}>{title}</h2>
        </div>
        <button
          onClick={() => navigate(NAVIGATION_PATHS[type === 'model' ? 'models' : 'datasets'])}
          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View All
        </button>
      </div>

      <div className={LAYOUT_CLASSES.trendingList}>
        {isLoading ? (
          Array.from({ length: TRENDING_CONFIG.maxItems }).map((_, index) => (
            <TrendingItemSkeleton key={index} />
          ))
        ) : (
          <>
            {hasData ? (
              displayData.map((item: any, index: number) => (
                <TrendingItem
                  key={item?.nft || index}
                  item={item}
                  index={index}
                  navigate={navigate}
                  type={type}
                />
              ))
            ) : (
              <EmptyState
                title={emptyStateConfig.title}
                icon={emptyStateConfig.icon}
                showBackToHome={false}
                action={emptyStateConfig.action}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PlatformStats = ({ ModelMetrics, transactions, loader }: PlatformStatsProps) => (
  <div className={LAYOUT_CLASSES.statsSection}>
    <h2 className={LAYOUT_CLASSES.statsTitle}>Platform Statistics</h2>
    <div className={LAYOUT_CLASSES.statsGrid}>
      <StatsCard
        value={ModelMetrics?.ai_model_count || 0}
        label={STATS_LABELS.aiModels}
        isLoading={loader}
        tooltip={STATS_TOOLTIPS.aiModels}
      />
      <StatsCard
        value={ModelMetrics?.dataset_count || 0}
        label={STATS_LABELS.datasets}
        isLoading={loader}
        tooltip={STATS_TOOLTIPS.datasets}
      />
      <StatsCard
        value={ModelMetrics?.asset_count || 0}
        label={STATS_LABELS.totalAssets}
        isLoading={loader}
        tooltip={STATS_TOOLTIPS.totalAssets}
      />
      <StatsCard
        value={transactions?.transaction_count || 0}
        label={STATS_LABELS.transactions}
        isLoading={loader}
      />
    </div>
  </div>
);


export function HomeView({ primaryColor }: HomeViewProps = {}) {
  const { nftData, loader, usageHistoryLoader } = useAuth();
  const [modelData, setModalData] = useState<any[]>([]);
  const [datasetData, setDatasetData] = useState<any[]>([]);
  const [ModelMetrics, setModelMetrics] = useState<any>({});
  const [transactions, setTransactions] = useState<any>({});
  const navigate = useNavigate();

 
  useEffect(() => {
    (async () => {
      let assets = await END_POINTS.get_asset_count();
      if (assets) {
        setModelMetrics(assets);
      }
      let transactions = await END_POINTS.get_transaction_count();
      if (transactions) {
        setTransactions(transactions);
      }
    })();
  }, []);

  
  useEffect(() => {
    if (!nftData?.length) {
      return;
    }

    const filteredModels = filterByType(nftData, "model").sort(sortByUsageHistory);
    const filteredDatasets = filterByType(nftData, "dataset").sort(sortByUsageHistory);

    setModalData(filteredModels);
    setDatasetData(filteredDatasets);
  }, [nftData]);

  return (
    <div className={LAYOUT_CLASSES.container}>
      <div className={LAYOUT_CLASSES.mainContent}>
        <PlatformStats
          ModelMetrics={ModelMetrics}
          transactions={transactions}
          loader={loader}
        />

        <div className={LAYOUT_CLASSES.trendingGrid}>
          <TrendingSection
            title="Top 5 AI Models"
            data={modelData}
            loader={loader}
            usageHistoryLoader={usageHistoryLoader}
            type="model"
            navigate={navigate}
          />

          <TrendingSection
            title="Top 5 Datasets"
            data={datasetData}
            loader={loader}
            usageHistoryLoader={usageHistoryLoader}
            type="dataset"
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}