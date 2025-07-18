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
import toast from 'react-hot-toast';
import { CONSTANTS } from '@/utils';
import axios from 'axios';

interface Tab {
  id: string;
  label: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'files', label: 'Files' },

  { id: 'metrics', label: 'Metrics' },
  { id: 'discussions', label: 'Discussions' },
  { id: 'history', label: 'Usage History' }
];

interface HistoryItem {
  NFTData: string;
  Epoch: number;
  TransactionID: string;
}

type BadgeType = 'published' | 'bought' | 'inference' | 'other';

const Badge = ({ type, children }: { type: BadgeType; children: React.ReactNode }) => {
  const styles = {
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bought: 'bg-blue-50 text-blue-700 border-blue-200',
    inference: 'bg-purple-50 text-purple-700 border-purple-200',
    other: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded text-xs font-medium border w-28 text-center ${styles[type]}`}>
      {children}
    </span>
  );
};

const getBadgeType = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('published and owned')) return { type: 'published' as BadgeType, text: 'Published & Owned' };
  if (desc.includes('bought by')) return { type: 'bought' as BadgeType, text: 'Bought' };
  if (desc.includes('used for inference')) return { type: 'inference' as BadgeType, text: 'Used for Inference' };
  return { type: 'other' as BadgeType, text: 'Other' };
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
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDetailedTime = (epoch: number): string => 
  new Date(epoch * 1000).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

interface HistoryItemComponentProps {
  item: HistoryItem;
  onTransactionClick: (transactionId: string) => void;
  sliceString: (str: string, length: number) => string;
}

const HistoryItemComponent = ({
  item,
  onTransactionClick,
  sliceString
}: HistoryItemComponentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const badge = getBadgeType(item.NFTData);

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
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Badge type={badge.type}>{badge.text}</Badge>

              <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>

              <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{formatTime(item.Epoch)}</span>
              </div>

              <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>

              <div className="flex items-center gap-1 text-sm text-gray-500 min-w-0 flex-1">
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="truncate font-mono">{sliceString(item.TransactionID, 12)}</span>
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
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <div>
                <span className="font-semibold text-gray-900">Description:</span>
                <p className="text-gray-700 mt-1 leading-relaxed">{item.NFTData}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-900">Time:</span>
                <p className="text-gray-700 mt-1">{formatDetailedTime(item.Epoch)}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-900">Transaction ID:</span>
                <p
                  className="text-blue-600 mt-1 cursor-pointer hover:text-blue-800 underline font-mono text-sm break-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransactionClick(item.TransactionID);
                  }}
                >
                  {item.TransactionID}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function DetailView() {
  const { connectedWallet, socketRef, setNftData, nftData, loader, infraProviders } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');


  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedInfra, setSelectedInfra] = useState('');
  const [nftFile, setNftFile] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const location = useLocation();
  let modelData = location?.state?.model || null;
  const navigate = useNavigate();
  const messageHandlerRef = useRef<any>(null);
  const { id } = useParams();
  const [model, setModel] = useState<any>({})

  useEffect(() => {
    if (modelData) {
      setModel(modelData)
    }
    else if (!loader && nftData?.length) {
      let name = id?.split("-")?.join(" ")
      let result = nftData?.find((item: any) => item?.metadata?.name == name)
      if (!result) {
        navigate('/dashboard/all')
        return
      }
      setModel({
        ...result,
        type: result?.metadata?.type
      })
    }
    else if (!loader && nftData?.length) {
      navigate('/dashboard/all')
    }

  }, [modelData, nftData, loader])


  useEffect(() => {
    if (model?.usageHistory?.length > 0) {
      setHistoryData(model?.usageHistory);
    }

  }, [model])

  useEffect(() => {
    (async () => {
      if (!model?.nft) {
        return
      }
      setNftFile(model?.nft_file_name || null);

    })()
  }, [model])

  const loadHistory = async () => {
    const history = await END_POINTS.get_usage_history({ nft: model?.nft }) as any;
    if (history?.status && history?.NFTDataReply?.length) {
      setHistoryData(history.NFTDataReply);
      setNftData((prev: any) => 
        prev.map((item: any) => 
          item.nft === model?.nft 
            ? { ...item, usageHistory: history.NFTDataReply }
            : item
        )
      );
    }
  };

  const downloadFile = async () => {
    try {
      setUploading(true)
      let infPr_d_url = String(infraProviders?.[0]?.providers?.[0]?.endpoints?.download)
      let artifact = await axios.get(`${infPr_d_url}/${model?.nft}`, {
        responseType: 'blob',
      });
      if (!artifact) {
        return
      }

      const extension = nftFile?.split('.') ?? [];

      const blob = new Blob([artifact.data], { type: extension[1] });

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${nftFile}`;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("File downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download file. Please try again.");
      console.error(`Error: ${(error as Error)?.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePurchase = async () => {
    if (!connectedWallet?.did) {
      toast.error("Please connect your wallet.");
      return;
    }
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
    const data = {
      use_asset: {
        asset_usage_price: parseFloat(model?.nft_value || 0) * 1000,
        asset_user_did: connectedWallet?.did,
        asset_usage_purpose: `${model?.type} bought by ${connectedWallet?.did} | timestamp: ${new Date().toISOString()}`,
        asset_denom: CONSTANTS.FT_DENOM,
        asset_owner_did: model?.owner_did,
        asset_id: model?.nft,
        asset_value: parseFloat(model?.nft_value || 0),
        ft_denom_creator: CONSTANTS.FT_DENOM_CREATOR,
      }
    };

    const messageHandler = (event: any) => {
      const result = event.data.data;
      if (!result?.status) {
        if (result?.message) toast.error(result?.message);
        return;
      }
      
      toast.success(result?.message);
      
      if (event?.data?.type === "CONTRACT_RESULT" && result?.step === "EXECUTE" && result?.status) {
        setUploading(true);
        return;
      }
      
      const isNFTResult = event?.data?.type === "NFT_RESULT" && result?.step === "SIGNATURE";
      const isFTResult = event?.data?.type === "FT_RESULT" && result?.step === "SIGNATURE";
      
      if (isNFTResult || isFTResult) {
        const message = {
          resut: null,
          message: event.data.data?.message,
          status: true,
        };
        
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify(message));
          console.log('Message sent:', message);
          
          if (isNFTResult) {
            setUploading(false);
            downloadFile();
            loadHistory();
          }
          return true;
        } else {
          console.error('WebSocket is not connected.');
          return false;
        }
      }
    };

    setUploading(true);

    messageHandlerRef.current = messageHandler;

    const executeData = {
      comment: "string",
      executorAddr: connectedWallet?.did,
      quorumType: 2,
      smartContractData: JSON.stringify(data),
      smartContractToken: CONSTANTS.BUY_TOKEN
    };

    window.addEventListener('message', messageHandler);
    if (window.myExtension) {
      try {
        window.myExtension.trigger({
          type: "INITIATE_CONTRACT",
          data: executeData
        });
      } catch (error) {
        console.error("Extension error:", error);
        alert("Please refresh the page to use the extension features");
      }
    } else {
      alert("Extension not detected.Please install the extension and refresh the page.");
      console.warn("Extension not detected. Please install the extension and refresh the page.");
    }
  };

  useEffect(() => {

    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, []);


  const handleTransactionClick = (id: string) => {
    window.open(`https://testnet.rubixexplorer.com/#/transaction/${id}`, '_blank');
  };
  const sliceString = (str: string, charsToShow = 5) => {
    if (!str) return '';
    if (str.length <= charsToShow * 2) return str;
    return `${str.slice(0, charsToShow)}...`;
  };

  return (
    <div style={{ marginTop: 120 }} className="min-h-[calc(100vh-150px)] bg-background">

      {loader ? (
        <DetailViewSkeleton />
      ) : (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/dashboard/all' },
                {
                  label:
                    model.type === 'model'
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
              ]}
            />
          </div>

          <HeroSection history={historyData} item={model} />

          <NavigationTabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {loader ? (
                      <OverviewSkeleton />
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                        <div className="prose prose-sm max-w-none">
                          <p className="mb-4 text-gray-600 whitespace-pre-line">
                            {model?.metadata?.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'files' && (
                  <motion.div key="files" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {loader ? (
                      <FilesSkeleton />
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                          <h2 className="text-xl font-semibold text-gray-900">Files</h2>
                        </div>
                        <div className="divide-y divide-slate-200">

                          <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{nftFile}</div>
                                {

}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </motion.div>
                )}


                {activeTab === 'metrics' && (
                  <motion.div key="metrics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {loader ? (
                      <MetricsSkeleton />
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>
                        <div className="grid grid-cols-2 gap-6">
                          {Object.entries(model.metadata).filter(([key]) =>
                            !["name", "description", "price", "type", "depinProviderDid"].includes(key)
                          ).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 rounded-lg p-4">
                              <div className="text-sm text-gray-500 mb-1 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="text-2xl font-semibold text-gray-900">{String(value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'discussions' && (
                  <motion.div key="discussions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {loader ? (
                      <DiscussionsSkeleton />
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                          <p className="text-gray-500 mb-4">Be the first to start a discussion about this {model?.type}</p>
                          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover">
                            Start Discussion
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage History</h3>
                        <p className="text-sm text-gray-600">Click on any item to expand details</p>
                      </div>

                      {historyData?.length > 0 ? (
                        <div className="relative">
                          <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200 opacity-60"></div>

                          {[...historyData].sort((a, b) => a.Epoch - b.Epoch).map((item, index) => (
                            <HistoryItemComponent
                              key={`${item.TransactionID}-${index}`}
                              item={item}
                              onTransactionClick={handleTransactionClick}
                              sliceString={sliceString}
                            />
                          ))}

                          <div className="absolute left-3 bottom-0 w-2 h-2 bg-blue-200 rounded-full opacity-60"></div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">No History Available</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {model?.type !== "assets" && <Sidebar
                item={model}
                selectedDataset={selectedDataset}
                selectedInfra={selectedInfra}
                showTryButton={String(nftFile).toLowerCase().endsWith(".gguf")}
                onDatasetChange={setSelectedDataset}
                onInfraChange={setSelectedInfra}
                onPurchase={handlePurchase}
                uploading={uploading}
              />}
            </div>
          </div>
        </>
      )
      }
    </div >
  );
}