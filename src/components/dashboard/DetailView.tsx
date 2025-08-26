import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Breadcrumbs,
  DetailViewSkeleton,
  OverviewSkeleton,
  FilesSkeleton,
  MetricsSkeleton,
  DiscussionsSkeleton,
} from '@/components/ui';
import { ChevronDown, ChevronRight, Clock, Hash } from 'lucide-react';
import { HeroSection, NavigationTabs, Sidebar } from './detail';
import { useAuth } from '@/hooks';
import { END_POINTS } from '@/api/requests';
import moment from 'moment';
import toast from 'react-hot-toast';
import { CONSTANTS, API_PORTS } from '@/config/network';
import axios from 'axios';
import { getNetworkColor, getNetworkHoverColor, NETWORK_COLORS } from '../../config/colors';
import { useLoader } from '@/contexts/LoaderContext';


interface Tab {
  id: string;
  label: string;
}

interface HistoryItem {
  NFTData: string;
  Epoch: number;
  TransactionID: string;
}

interface BadgeProps {
  type: 'published' | 'bought' | 'inference' | 'other';
  children: React.ReactNode;
}

interface HistoryItemComponentProps {
  item: HistoryItem;
  index: number;
  isLast: boolean;
  onTransactionClick: (transactionId: string) => void;
  sliceString: (str: string, length: number) => string;
}

interface BadgeType {
  type: 'published' | 'bought' | 'inference' | 'other';
  text: string;
}

interface DetailViewProps {
  primaryColor?: string;
}

interface OverviewTabProps {
  model: any;
  loader: boolean;
}

interface FilesTabProps {
  nftFile: string | null;
  loader: boolean;
}

interface MetricsTabProps {
  model: any;
  loader: boolean;
}

interface DiscussionsTabProps {
  model: any;
  loader: boolean;
}

interface HistoryTabProps {
  historyData: HistoryItem[];
  onTransactionClick: (transactionId: string) => void;
  sliceString: (str: string, length: number) => string;
}

interface TimelineProps {
  historyData: HistoryItem[];
  onTransactionClick: (transactionId: string) => void;
  sliceString: (str: string, length: number) => string;
}


const TABS: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'files', label: 'Files' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'discussions', label: 'Discussions' },
  { id: 'history', label: 'Usage History' }
];

const BADGE_STYLES = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  bought: 'bg-blue-50 text-blue-700 border-blue-200',
  inference: 'bg-purple-50 text-purple-700 border-purple-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200'
} as const;

const LAYOUT_CLASSES = {
  container: 'min-h-[calc(100vh-150px)] bg-[#f6f6f7]',
  mainContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4',
  contentContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  gridContainer: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
  mainContent: 'lg:col-span-2 space-y-8',
  tabContainer: 'bg-white rounded-xl border border-[#e1e3e5] p-6',
  tabTitle: 'text-xl font-semibold text-gray-900 mb-4',
  prose: 'prose prose-sm max-w-none',
  description: 'mb-4 text-gray-600 whitespace-pre-line',
  filesContainer: 'bg-white rounded-xl border border-[#e1e3e5] overflow-hidden',
  filesHeader: 'px-6 py-4 border-b border-[#e1e3e5]',
  filesList: 'divide-y divide-[#e1e3e5]',
  fileItem: 'px-6 py-4 flex items-center justify-between hover:bg-gray-50',
  fileIcon: 'w-10 h-10 rounded-lg flex items-center justify-center',
  fileInfo: 'flex items-center gap-3',
  fileName: 'text-sm font-medium text-gray-900',
  metricsGrid: 'grid grid-cols-2 gap-6',
  metricItem: 'bg-gray-50 rounded-lg p-4',
  metricLabel: 'text-sm text-gray-500 mb-1 capitalize',
  metricValue: 'text-2xl font-semibold text-gray-900',
  discussionsContainer: 'bg-white rounded-xl border border-[#e1e3e5] p-6',
  discussionsContent: 'text-center py-8',
  discussionsIcon: 'w-12 h-12 text-gray-400 mx-auto mb-4',
  discussionsTitle: 'text-lg font-medium text-gray-900 mb-2',
  discussionsDescription: 'text-gray-500 mb-4',
  discussionsButton: 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white',
  historyContainer: 'bg-white rounded-xl border border-[#e1e3e5] p-6',
  historyHeader: 'mb-6',
  historyTitle: 'text-lg font-semibold text-gray-900 mb-2',
  historyDescription: 'text-sm text-gray-600',
  timelineContainer: 'relative space-y-2',
  timelineBackbone: 'absolute left-4 top-6 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200 opacity-60',
  timelineEndCap: 'absolute left-3 bottom-0 w-2 h-2 bg-blue-200 rounded-full opacity-60',
  emptyHistory: 'text-center py-12',
  emptyHistoryIcon: 'w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center',
  emptyHistoryText: 'text-gray-500'
} as const;

const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
} as const;


const getBadgeType = (description: string): BadgeType => {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('published and owned')) {
    return { type: 'published', text: 'Published & Owned' };
  } else if (lowerDesc.includes('bought by')) {
    return { type: 'bought', text: 'Bought' };
  } else if (lowerDesc.includes('used for inference')) {
    return { type: 'inference', text: 'Used for Inference' };
  } else {
    return { type: 'other', text: 'Other' };
  }
};

const formatTime = (epoch: number): string => {
  const date = new Date(epoch * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

 
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

 
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatDetailedTime = (epoch: number): string => {
  return new Date(epoch * 1000).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const sliceString = (str: string, charsToShow = 5): string => {
  if (!str) return '';
  if (str.length <= charsToShow * 2) return str;

  const start = str.slice(0, charsToShow);
  const end = str.slice(-charsToShow);

  return `${start}...${end}`;
};

const getBreadcrumbItems = (model: any) => [
  { label: 'Home', href: '/dashboard/all' },
  {
    label: model.type === 'model'
      ? 'AI Models'
      : model.type === 'dataset'
        ? 'Datasets'
        : model.type === 'assets' ? "assets" : 'Infra Providers',
    href: `/dashboard/${model.type === 'model'
      ? 'models'
      : model.type === 'dataset'
        ? 'datasets'
        : model.type === 'assets' ? "assets" : 'infra-providers'
      }`
  },
  { label: model?.metadata?.name }
];

const createUseAssetData = (model: any, connectedWallet: any) => ({
  use_asset: {
    "asset_usage_price": parseFloat(model?.nft_value || 0) * 1000,
    "asset_user_did": connectedWallet?.did,
    "asset_usage_purpose": `${model?.type} bought by ${connectedWallet?.did} | timestamp: ${new Date().toISOString()}`,
    "asset_denom": CONSTANTS.FT_DENOM,
    "asset_owner_did": model?.owner_did,
    "asset_id": model?.nft,
    "asset_value": parseFloat(model?.nft_value || 0),
    "ft_denom_creator": CONSTANTS.FT_DENOM_CREATOR,
  }
});

const createExecuteData = (data: any, connectedWallet: any) => ({
  "comment": "string",
  "executorAddr": connectedWallet?.did,
  "quorumType": 2,
  "smartContractData": JSON.stringify(data),
  smartContractToken: CONSTANTS.BUY_TOKEN
});

const downloadFileFromUrl = async (url: string, filename: string): Promise<void> => {
  const response = await axios.get(url, { responseType: 'blob' });
  const extension = filename?.split('.') ?? [];
  const blob = new Blob([response.data], { type: extension[1] });
  const downloadUrl = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
};


const Badge: React.FC<BadgeProps> = ({ type, children }) => (
  <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${BADGE_STYLES[type]}`}>
    {children}
  </span>
);

const HistoryItemComponent: React.FC<HistoryItemComponentProps> = ({
  item,
  index,
  isLast,
  onTransactionClick,
  sliceString
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const badge = getBadgeType(item.NFTData);

  // Function to format JSON data for better display
  const formatJSONData = (data: string) => {
    try {
      // Try to parse and format JSON
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not valid JSON, return as is
      return data;
    }
  };

  // Function to check if data looks like JSON
  const isJSONLike = (data: string) => {
    return data.trim().startsWith('{') || data.trim().startsWith('[');
  };

  return (
    <div className="relative">
      <div className="absolute left-2.5 top-6 w-3 h-3 bg-white border-2 border-blue-400 rounded-full shadow-lg z-10">
        <div className="absolute inset-0.5 bg-blue-400 rounded-full"></div>
        {isExpanded && (
          <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
        )}
      </div>

      <div className="absolute left-6 top-7 w-4 h-0.5 bg-gradient-to-r from-blue-400 to-gray-200"></div>

      <div className="ml-10 pb-6">
        <div
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Badge type={badge.type}>{badge.text}</Badge>

              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>

              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{formatTime(item.Epoch)}</span>
              </div>

              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>

              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 min-w-0 flex-1">
                <Hash className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate font-mono">{sliceString(item.TransactionID, 6)}</span>
              </div>
            </div>

            <div className="flex-shrink-0 ml-2">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              <div>
                <span className="font-semibold text-gray-900 text-sm">Description:</span>
                <div className="mt-2">
                  {isJSONLike(item.NFTData) ? (
                    <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-words leading-relaxed">
                        {formatJSONData(item.NFTData)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-700 mt-1 leading-relaxed break-words text-sm">{item.NFTData}</p>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-900 text-sm">Time:</span>
                <p className="text-gray-700 mt-1 text-sm">{formatDetailedTime(item.Epoch)}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-900 text-sm">Transaction ID:</span>
                <div className="mt-1">
                  <p
                    className="text-blue-600 cursor-pointer hover:text-blue-800 underline font-mono text-xs break-all bg-blue-50 p-2 rounded hover:bg-blue-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTransactionClick(item.TransactionID);
                    }}
                  >
                    {item.TransactionID}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ model, loader }: OverviewTabProps) => (
  <motion.div key="overview" initial={ANIMATION_CONFIG.initial} animate={ANIMATION_CONFIG.animate}>
    {loader ? (
      <OverviewSkeleton />
    ) : (
      <div className={LAYOUT_CLASSES.tabContainer}>
        <h2 className={LAYOUT_CLASSES.tabTitle}>About</h2>
        <div className={LAYOUT_CLASSES.prose}>
          <p className={LAYOUT_CLASSES.description}>
            {model?.metadata?.description}
          </p>
        </div>
      </div>
    )}
  </motion.div>
);

const FilesTab = ({ nftFile, loader }: FilesTabProps) => (
  <motion.div key="files" initial={ANIMATION_CONFIG.initial} animate={ANIMATION_CONFIG.animate}>
    {loader ? (
      <FilesSkeleton />
    ) : (
      <div className={LAYOUT_CLASSES.filesContainer}>
        <div className={LAYOUT_CLASSES.filesHeader}>
          <h2 className={LAYOUT_CLASSES.tabTitle}>Files</h2>
        </div>
        <div className={LAYOUT_CLASSES.filesList}>
          <div className={LAYOUT_CLASSES.fileItem}>
            <div className={LAYOUT_CLASSES.fileInfo}>
              <div 
                className={LAYOUT_CLASSES.fileIcon} 
                style={{ backgroundColor: `rgba(${NETWORK_COLORS.primaryRgb}, 0.1)` }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: getNetworkColor() }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className={LAYOUT_CLASSES.fileName}>{nftFile}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </motion.div>
);

const MetricsTab = ({ model, loader }: MetricsTabProps) => (
  <motion.div key="metrics" initial={ANIMATION_CONFIG.initial} animate={ANIMATION_CONFIG.animate}>
    {loader ? (
      <MetricsSkeleton />
    ) : (
      <div className={LAYOUT_CLASSES.tabContainer}>
        <h2 className={LAYOUT_CLASSES.tabTitle}>Performance Metrics</h2>
        <div className={LAYOUT_CLASSES.metricsGrid}>
          {Object.entries(model.metadata).filter(([key]) =>
            !["name", "description", "price", "type", "depinProviderDid"].includes(key)
          ).map(([key, value]) => (
            <div key={key} className={LAYOUT_CLASSES.metricItem}>
              <div className={LAYOUT_CLASSES.metricLabel}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className={LAYOUT_CLASSES.metricValue}>{String(value)}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

const DiscussionsTab = ({ model, loader }: DiscussionsTabProps) => (
  <motion.div key="discussions" initial={ANIMATION_CONFIG.initial} animate={ANIMATION_CONFIG.animate}>
    {loader ? (
      <DiscussionsSkeleton />
    ) : (
      <div className={LAYOUT_CLASSES.discussionsContainer}>
        <div className={LAYOUT_CLASSES.discussionsContent}>
          <svg className={LAYOUT_CLASSES.discussionsIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className={LAYOUT_CLASSES.discussionsTitle}>No discussions yet</h3>
          <p className={LAYOUT_CLASSES.discussionsDescription}>
            Be the first to start a discussion about this {model?.type}
          </p>
          <button 
            className={LAYOUT_CLASSES.discussionsButton}
            style={{ backgroundColor: getNetworkColor() }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getNetworkHoverColor()}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = getNetworkColor()}
          >
            Start Discussion
          </button>
        </div>
      </div>
    )}
  </motion.div>
);

const Timeline = ({ historyData, onTransactionClick, sliceString }: TimelineProps) => (
  <div className={LAYOUT_CLASSES.timelineContainer}>
    <div className={LAYOUT_CLASSES.timelineBackbone}></div>

    {[...historyData].sort((a, b) => a.Epoch - b.Epoch).map((item, index, sortedArray) => (
      <HistoryItemComponent
        key={`${item.TransactionID}-${index}`}
        item={item}
        index={index}
        isLast={index === sortedArray.length - 1}
        onTransactionClick={onTransactionClick}
        sliceString={sliceString}
      />
    ))}

    <div className={LAYOUT_CLASSES.timelineEndCap}></div>
  </div>
);

const HistoryTab = ({ historyData, onTransactionClick, sliceString }: HistoryTabProps) => (
  <motion.div key="history" initial={ANIMATION_CONFIG.initial} animate={ANIMATION_CONFIG.animate}>
    <div className={LAYOUT_CLASSES.historyContainer}>
      <div className={LAYOUT_CLASSES.historyHeader}>
        <h3 className={LAYOUT_CLASSES.historyTitle}>Usage History</h3>
        <p className={LAYOUT_CLASSES.historyDescription}>Click on any item to expand details</p>
      </div>

      {historyData?.length > 0 ? (
        <Timeline
          historyData={historyData}
          onTransactionClick={onTransactionClick}
          sliceString={sliceString}
        />
      ) : (
        <div className={LAYOUT_CLASSES.emptyHistory}>
          <div className={LAYOUT_CLASSES.emptyHistoryIcon}>
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className={LAYOUT_CLASSES.emptyHistoryText}>No History Available</p>
        </div>
      )}
    </div>
  </motion.div>
);


export function DetailView({ primaryColor = getNetworkColor() }: DetailViewProps = {}) {
  const { id: _ } = useParams();
  const { connectedWallet, socketRef, setNftData, nftData, loader, infraProviders } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);


  const [showTryButton, setShowTryButton] = useState(false);
  const [nftFile, setNftFile] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const location = useLocation();
  let modelData = location?.state?.model || null;
  const navigate = useNavigate();
  const messageHandlerRef = useRef<any>(null);
  const wsMessageHandlerRef = useRef<any>(null);
  const { id } = useParams();
  const [model, setModel] = useState<any>({});
  const { setBuyingAssetLoading, setDownloadingAssetLoading, loaders } = useLoader();


  useEffect(() => {
    if (!loaders.buyingAsset && uploading) {
      setUploading(false);
      downloadFile();
      loadHistory();
    }
  }, [loaders.buyingAsset, uploading]);

  useEffect(() => {
    if (modelData) {
      setModel(modelData);
    } else if (!loader && nftData?.length) {
      let name = id?.split("-")?.join(" ");
      let result = nftData?.find((item: any) => item?.metadata?.name == name);
      if (!result) {
        navigate('/dashboard/all');
        return;
      }
      setModel({
        ...result,
        type: result?.metadata?.type
      });
    } else if (!loader && nftData?.length) {
      navigate('/dashboard/all');
    }
  }, [modelData, nftData, loader, id, navigate]);

  useEffect(() => {
  
    const isGGUFModel = String(nftFile).toLowerCase().endsWith('.gguf');
    setShowTryButton(isGGUFModel);
  }, [nftFile]);

  useEffect(() => {
    if (model?.usageHistory?.length > 0) {
      setHistoryData(model?.usageHistory);
    }
  }, [model]);

  useEffect(() => {
    (async () => {
      if (!model?.nft) {
        return;
      }
      setNftFile(model?.nft_file_name || null);
    })();
  }, [model]);

  async function loadHistory() {
    let history = await END_POINTS.get_usage_history({ nft: model?.nft }) as any;
    if (history?.status && history?.NFTDataReply?.length) {
      setHistoryData(history?.NFTDataReply);
      setNftData((prev: any) => {
        return prev.map((item: any) => {
          if (item.nft == model?.nft) {
            return {
              ...item,
              usageHistory: history?.NFTDataReply
            };
          }
          return item;
        });
      });
    }
  }

  const downloadFile = async () => {
    try {
      setUploading(true);
      setDownloadingAssetLoading(true);
      let infPr_d_url = String(infraProviders?.[0]?.providers?.[0]?.endpoints?.download);
      await downloadFileFromUrl(`${infPr_d_url}/${model?.nft}`, nftFile || '');
      toast.success("File downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download file. Please try again.");
      setUploading(false);
      setDownloadingAssetLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!connectedWallet?.did) {
      toast.error("Please connect your wallet.");
      return;
    }

    setUploading(true);
    setBuyingAssetLoading(true);

    try {
      const data = createUseAssetData(model, connectedWallet);
      const executeData = createExecuteData(data, connectedWallet);

      if (!window.xell) {
        alert("Extension not detected. Please install the extension and refresh the page.");
        setUploading(false);
        setBuyingAssetLoading(false);
        return;
      }

      const result = await window.xell.executeContract(executeData);

      if (result.status && result.data) {
        toast.success(result.data.message);
      } else {
        toast.error(result.data.message);
        setUploading(false);
        setBuyingAssetLoading(false);
      }
    } catch (error) {
      alert("Please refresh the page to use the extension features");
      setUploading(false);
      setBuyingAssetLoading(false);
    }
  };

  const onTransactionClick = (transactionId: string) => {
    window.open(`${API_PORTS.explorer}/#/transaction/${transactionId}`, '_blank');
  };

  return (
    <div style={{ marginTop: 120 }} className={LAYOUT_CLASSES.container}>
      {loader ? (
        <DetailViewSkeleton />
      ) : (
        <>
          <div className={LAYOUT_CLASSES.mainContainer}>
            <Breadcrumbs items={getBreadcrumbItems(model)} />
          </div>

          <HeroSection history={historyData} item={model} />

          <NavigationTabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className={LAYOUT_CLASSES.contentContainer}>
            <div className={LAYOUT_CLASSES.gridContainer}>
              <div className={LAYOUT_CLASSES.mainContent}>
                {activeTab === 'overview' && (
                  <OverviewTab model={model} loader={loader} />
                )}

                {activeTab === 'files' && (
                  <FilesTab nftFile={nftFile} loader={loader} />
                )}

                {activeTab === 'metrics' && (
                  <MetricsTab model={model} loader={loader} />
                )}

                {activeTab === 'discussions' && (
                  <DiscussionsTab model={model} loader={loader} />
                )}

                {activeTab === 'history' && (
                  <HistoryTab
                    historyData={historyData}
                    onTransactionClick={onTransactionClick}
                    sliceString={sliceString}
                  />
                )}
              </div>

              {model?.type !== "assets" && (
                <Sidebar
                  item={model}
                  showTryButton={showTryButton}
                  onPurchase={handlePurchase}
                  uploading={uploading}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}