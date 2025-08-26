import { ReactNode, useRef } from 'react';
import { AuthContext } from '@/contexts/auth';
import { useState, useCallback, useEffect } from 'react';
import { WalletService, WalletType } from '@/services/wallet';
import { END_POINTS } from '@/api/requests';
import { fetchInferenceBalance } from '@/utils/balanceUtils';
import { X } from 'lucide-react';
import { CONSTANTS, API_PORTS } from '@/config/network';
import { getNetworkColor, getNetworkHoverColor } from '../../config/colors';
import { STORAGE_KEYS, storageUtils } from '@/constants/storage';
import { useLoader } from '@/contexts/LoaderContext';
import { toast } from 'react-hot-toast';


interface AuthProviderProps {
  children: ReactNode;
}

interface StoredWalletInterface {
  did: string;
  username: string;
}

interface ConnectedWallet {
  did: string;
  username: string;
}

interface NFTData {
  nft: string;
  nft_metadata: string;
  metadata?: Record<string, any>;
  usageHistory?: any[];
}

interface InfraProvider {
  storage: string;
  memory: string;
  os: string;
  core: string;
  gpu: string;
  processor: string;
  region: string;
  hostingCost: number;
  platformName: string;
  providerName: string;
  platformImageUri: string;
  platformDescription: string;
  providerDid: string;
}

interface GroupedInfraProvider {
  name: string;
  description: string;
  providers: InfraProvider[];
}

interface WebSocketMessage {
  type: string;
  data?: {
    action: string;
    payload: any;
  };
}

interface AddCreditPayload {
  add_credit: {
    user_did: string;
    current_timestamp: number;
  };
}

interface AddCreditExecuteData {
  comment: string;
  executorAddr: string;
  quorumType: number;
  smartContractData: string;
  smartContractToken: string;
}

interface ExtensionModalProps {
  show: boolean;
  onClose: () => void;
  onInstallExtension: () => void;
  onReloadPage: () => void;
}

interface WebSocketHandlerProps {
  data: WebSocketMessage;
  connectedWallet: ConnectedWallet | null;
  socketRef: React.MutableRefObject<WebSocket | null | undefined>;
  setUploadModelLoading: (loading: boolean) => void;
  setUploadDatasetLoading: (loading: boolean) => void;
  setBuyingAssetLoading: (loading: boolean) => void;
  setBuyingTokensLoading: (loading: boolean) => void;
  triggerAddCreditContract: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}


const EXCLUDED_PATHS = ['/faucet', '/faucet/'];
const CREDIT_PURCHASE_COMMENT = 'Credit Purchase';
const ADD_CREDIT_COMMENT = 'Add credit after purchase';
const WEBSOCKET_RECONNECT_DELAY = 100;
const BALANCE_REFRESH_DELAY = 3000;
const QUORUM_TYPE = 2;



const WEBSOCKET_ACTIONS = {
  DEPLOY_NFT: 'DEPLOY_NFT',
  TRANSFER_FT: 'TRANSFER_FT',
  EXECUTE_NFT: 'EXECUTE_NFT',
  EXECUTE_TOKENS: 'EXECUTE_TOKENS'
} as const;

const WEBSOCKET_MESSAGE_TYPES = {
  OPEN_EXTENSION: 'OPEN_EXTENSION',
  HELLO: 'hello'
} as const;

const LAYOUT_CLASSES = {
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
    container: 'bg-gray-800 rounded-lg p-6 max-w-md w-full relative',
    closeButton: 'absolute top-4 right-4 text-gray-400 hover:text-white',
    content: 'text-center mb-6',
    icon: 'w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4',
    title: 'text-white text-xl font-bold font-[\'IBM_Plex_Sans\']',
    description: 'text-gray-300 mt-2 font-[\'IBM_Plex_Sans\']',
    buttonContainer: 'flex flex-col space-y-3',
    primaryButton: 'w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors font-[\'IBM_Plex_Sans\']',
    secondaryButton: 'w-full py-3 text-white font-semibold rounded-lg transition-colors font-[\'IBM_Plex_Sans\']',
    cancelButton: 'w-full py-3 bg-transparent border border-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors font-[\'IBM_Plex_Sans\']'
  }
} as const;

const TOAST_MESSAGES = {
  CREDIT_ADDITION_SUCCESS: 'Credit added successfully',
  CREDIT_ADDITION_FAILED: 'Credit addition failed',
  EXTENSION_NOT_DETECTED: 'Extension not detected for add credit',
  DEPLOY_SUCCESS: 'NFT deployed successfully',
  DEPLOY_FAILED: 'Deploy failed due to error',
  TRANSFER_SUCCESS: 'Transfer completed successfully',
  TRANSFER_FAILED: 'Transfer failed',
  EXECUTE_SUCCESS: 'NFT executed successfully',
  EXECUTE_FAILED: 'Execute failed',
  TOKEN_PURCHASE_SUCCESS: 'Token purchase completed successfully',
  TOKEN_PURCHASE_FAILED: 'Token purchase failed',
  WALLET_CONNECTION_FAILED: 'Wallet connection failed'
} as const;


const createAddCreditPayload = (userDid: string): AddCreditPayload => ({
  add_credit: {
    user_did: userDid,
    current_timestamp: Math.floor(Date.now() / 1000)
  }
});

const createAddCreditExecuteData = (payload: AddCreditPayload, userDid: string): AddCreditExecuteData => ({
  comment: ADD_CREDIT_COMMENT,
  executorAddr: userDid,
  quorumType: QUORUM_TYPE,
  smartContractData: JSON.stringify(payload),
  smartContractToken: CONSTANTS.TOPUP_TOKEN
});

const groupByPlatformName = (infraProviders: InfraProvider[]): GroupedInfraProvider[] => {
  const grouped = infraProviders.reduce((acc, provider) => {
    if (!acc[provider.platformName]) {
      acc[provider.platformName] = {
        name: provider.platformName,
        description: provider.platformDescription,
        providers: []
      };
    }
    acc[provider.platformName].providers.push(provider);
    return acc;
  }, {} as Record<string, GroupedInfraProvider>);

  return Object.values(grouped);
};

const parseNFTMetadata = (nft: NFTData): NFTData => {
  try {
    return {
      ...nft,
      metadata: JSON.parse(nft.nft_metadata || '{}')
    };
  } catch (error) {
    return {
      ...nft,
      metadata: {}
    };
  }
};

const filterNFTsByCompetition = (nfts: NFTData[], compId: string): NFTData[] => {
  return nfts.filter(item => 
    item && item.metadata && item.metadata.compId === compId
  );
};

const filterNonCompetitionNFTs = (nfts: NFTData[]): NFTData[] => {
  return nfts.filter(item => 
    item && item.metadata && !item.metadata.compId
  ).reverse();
};

const isExcludedPath = (path: string): boolean => {
  return EXCLUDED_PATHS.includes(path);
};

const getCurrentPath = (): string => {
  return window?.location?.pathname || '';
};

const saveToStorage = (key: string, data: any): void => {
  storageUtils.setItem(key as any, data);
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  return storageUtils.getItem(key as any, defaultValue);
};

const removeFromStorage = (key: string): void => {
  storageUtils.removeItem(key as any);
};

const showToast = (message: string, type: 'success' | 'error' = 'success'): void => {
  if (type === 'success') {
    toast.success(message);
  } else {
    toast.error(message);
  }
};

const dispatchInferenceBalanceEvent = (balance: number): void => {
  window.dispatchEvent(new CustomEvent('updateInferenceBalance', { detail: balance }));
};


const ExtensionModal: React.FC<ExtensionModalProps> = ({
  show,
  onClose,
  onInstallExtension,
  onReloadPage
}) => {
  if (!show) return null;

  return (
    <div className={LAYOUT_CLASSES.modal.overlay}>
      <div className={LAYOUT_CLASSES.modal.container}>
        <button onClick={onClose} className={LAYOUT_CLASSES.modal.closeButton}>
          <X className="w-5 h-5" />
        </button>

        <div className={LAYOUT_CLASSES.modal.content}>
          <div className={LAYOUT_CLASSES.modal.icon}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className={LAYOUT_CLASSES.modal.title}>
            Wallet Connection Issue
          </h3>
          <p className={LAYOUT_CLASSES.modal.description}>
            There seems to be an issue with the XELL wallet connection. You may need to install the extension or reload the page to continue.
          </p>
        </div>

        <div className={LAYOUT_CLASSES.modal.buttonContainer}>
          <button
            onClick={onInstallExtension}
            className={LAYOUT_CLASSES.modal.primaryButton}
          >
            Install Extension
          </button>

          <button
            onClick={onReloadPage}
            className={LAYOUT_CLASSES.modal.secondaryButton}
            style={{ backgroundColor: getNetworkColor() }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getNetworkHoverColor()}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = getNetworkColor()}
          >
            Reload Page
          </button>

          <button
            onClick={onClose}
            className={LAYOUT_CLASSES.modal.cancelButton}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


const handleDeployNFT = async (
  payload: any,
  socketRef: React.MutableRefObject<WebSocket | null | undefined>,
  setUploadModelLoading: (loading: boolean) => void,
  setUploadDatasetLoading: (loading: boolean) => void
): Promise<void> => {
  try {
    if (!window.xell) {
      showToast('Extension not available', 'error');
      return;
    }
    const result = await window.xell.deployNFT(payload);
    
    if (result?.status) {
      showToast(result.data.message, 'success');
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(result.data));
      }
    } else {
      setUploadModelLoading(false);
      setUploadDatasetLoading(false);
      showToast(result?.data?.message || TOAST_MESSAGES.DEPLOY_FAILED, 'error');
    }
  } catch (error) {
    showToast('Deploy NFT failed', 'error');
    setUploadModelLoading(false);
    setUploadDatasetLoading(false);
  }
};

const handleTransferFT = async (
  payload: any,
  socketRef: React.MutableRefObject<WebSocket | null | undefined>,
  setUploadModelLoading: (loading: boolean) => void,
  setUploadDatasetLoading: (loading: boolean) => void,
  setBuyingTokensLoading: (loading: boolean) => void,
  triggerAddCreditContract: () => Promise<void>
): Promise<void> => {
  try {
    if (!window.xell) {
      showToast('Extension not available', 'error');
      return;
    }
    const result = await window.xell.transferFT(payload);
    
    if (result?.status) {
      showToast(result.data.message, 'success');
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(result.data));
      }
      
      setUploadModelLoading(false);
      setUploadDatasetLoading(false);
      
      const isBuyMoreTransfer = payload?.comment === CREDIT_PURCHASE_COMMENT;
      
      if (isBuyMoreTransfer) {
        try {
          await triggerAddCreditContract();
        } catch (error) {
          setBuyingTokensLoading(false);
        }
      } else {
        setBuyingTokensLoading(false);
      }
    } else {
      setUploadModelLoading(false);
      setUploadDatasetLoading(false);
      setBuyingTokensLoading(false);
      showToast(result?.data?.message || TOAST_MESSAGES.TRANSFER_FAILED, 'error');
    }
  } catch (error) {
    showToast('Transfer failed', 'error');
    setUploadModelLoading(false);
    setUploadDatasetLoading(false);
    setBuyingTokensLoading(false);
  }
};

const handleExecuteNFT = async (
  payload: any,
  socketRef: React.MutableRefObject<WebSocket | null | undefined>,
  setBuyingAssetLoading: (loading: boolean) => void
): Promise<void> => {
  try {
    if (!window.xell) {
      showToast('Extension not available', 'error');
      return;
    }
    const result = await window.xell.executeNFT(payload);
    
    if (result?.status) {
      showToast(result.data.message, 'success');
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(result.data));
      }
      setBuyingAssetLoading(false);
    } else {
      showToast(result?.data?.message || TOAST_MESSAGES.EXECUTE_FAILED, 'error');
      setBuyingAssetLoading(false);
    }
  } catch (error) {
    showToast('Execute failed', 'error');
    setBuyingAssetLoading(false);
  }
};

const handleExecuteTokens = async (
  payload: any,
  socketRef: React.MutableRefObject<WebSocket | null | undefined>,
  setBuyingTokensLoading: (loading: boolean) => void,
  connectedWallet: ConnectedWallet | null,
  refreshBalance: () => Promise<void>
): Promise<void> => {
  try {
    if (!window.xell) {
      showToast('Extension not available', 'error');
      return;
    }
    const result = await window.xell.executeContract(payload);
    
    if (result?.status) {
      showToast(result.data.message, 'success');
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(result.data));
      }
      setBuyingTokensLoading(false);
      
      setTimeout(async () => {
        if (connectedWallet?.did) {
          try {
            const balance = await fetchInferenceBalance(connectedWallet.did);
            if (balance !== null) {
              dispatchInferenceBalanceEvent(balance);
            }
            await refreshBalance();
          } catch (error) {
            
          }
        }
      }, BALANCE_REFRESH_DELAY);
    } else {
      showToast(result?.data?.message || TOAST_MESSAGES.TOKEN_PURCHASE_FAILED, 'error');
      setBuyingTokensLoading(false);
    }
  } catch (error) {
    showToast('Token purchase failed', 'error');
    setBuyingTokensLoading(false);
  }
};


export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [allNftData, setAllNftData] = useState<NFTData[]>([]);
  const [infraProviders, setInfraProviders] = useState<GroupedInfraProvider[]>([]);
  const [compNftData, setCompNftData] = useState<Record<string, NFTData[]>>({});
  const [loader, setLoader] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [usageHistoryLoader, setUsageHistoryLoader] = useState(false);
  
  const { 
    setUploadModelLoading, 
    setUploadDatasetLoading, 
    setBuyingAssetLoading, 
    setBuyingTokensLoading 
  } = useLoader();

  const socketRef = useRef<WebSocket | null>();
  const currentPath = getCurrentPath();

  const triggerAddCreditContract = async (): Promise<void> => {
    if (!connectedWallet?.did) {
      return;
    }

    const addCreditPayload = createAddCreditPayload(connectedWallet.did);
    const addCreditExecuteData = createAddCreditExecuteData(addCreditPayload, connectedWallet.did);
     
    if (window.xell) {
      try {
        const result = await window.xell.executeContract(addCreditExecuteData);
        
        if (result?.status) {
          showToast(result?.data?.message || TOAST_MESSAGES.CREDIT_ADDITION_SUCCESS, 'success');
          setBuyingTokensLoading(false);
          
          setTimeout(async () => {
            if (connectedWallet?.did) {
              try {
                const balance = await fetchInferenceBalance(connectedWallet.did);
                if (balance !== null) {
                  dispatchInferenceBalanceEvent(balance);
                }
                await refreshBalance();
              } catch (error) {

              }
            }
          }, BALANCE_REFRESH_DELAY);
        } else {
          showToast(result?.data?.message || TOAST_MESSAGES.CREDIT_ADDITION_FAILED, 'error');
          setBuyingTokensLoading(false);
        }
      } catch (error) {
        showToast('Failed to initiate credit addition.', 'error');
        setBuyingTokensLoading(false);
      }
    } else {
      showToast(TOAST_MESSAGES.EXTENSION_NOT_DETECTED, 'error');
      setBuyingTokensLoading(false);
    }
  };

  const refreshBalance = async (): Promise<void> => {
    try {
      if (!connectedWallet?.did) {
        return;
      }
      
      const getTokenCount = await END_POINTS.get_ft_info_by_did({ did: connectedWallet?.did }) as any;
      
      if (!getTokenCount?.status || getTokenCount?.ft_info?.length < 1) {
        return;
      }
      
      const newTrieToken = getTokenCount?.ft_info?.filter((item: any) => 
        item?.creator_did === CONSTANTS.FT_DENOM_CREATOR
      )?.[0];
      
      if (!newTrieToken) {
        return;
      }
      
      setTokenBalance(parseFloat(newTrieToken?.ft_count || 0) || 0);
    } catch (error) {
      
    }
  };

  const connectWebSocket = (): void => {
    const wsUrl = `${API_PORTS.websocket}?clientID=${connectedWallet?.did}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      const initialMessage = {
        type: WEBSOCKET_MESSAGE_TYPES.HELLO,
        clientId: "client-124",
        timestamp: Date.now(),
      };
      ws.send(JSON.stringify(initialMessage));
    };

    ws.onmessage = async (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        if (data?.type === WEBSOCKET_MESSAGE_TYPES.OPEN_EXTENSION) {
          if (!window.xell) {
            return;
          }
          
          switch (data?.data?.action) {
            case WEBSOCKET_ACTIONS.DEPLOY_NFT:
              await handleDeployNFT(
                data?.data?.payload,
                socketRef,
                setUploadModelLoading,
                setUploadDatasetLoading
              );
              break;
              
            case WEBSOCKET_ACTIONS.TRANSFER_FT:
              await handleTransferFT(
                data?.data?.payload,
                socketRef,
                setUploadModelLoading,
                setUploadDatasetLoading,
                setBuyingTokensLoading,
                triggerAddCreditContract
              );
              break;
              
            case WEBSOCKET_ACTIONS.EXECUTE_NFT:
              await handleExecuteNFT(
                data?.data?.payload,
                socketRef,
                setBuyingAssetLoading
              );
              break;
              
            case WEBSOCKET_ACTIONS.EXECUTE_TOKENS:
              await handleExecuteTokens(
                data?.data?.payload,
                socketRef,
                setBuyingTokensLoading,
                connectedWallet,
                refreshBalance
              );
              break;
              
            default:
              break;
          }
        }
      } catch (error) {
        
      }
    };

    ws.onclose = () => {
      setTimeout(connectWebSocket, WEBSOCKET_RECONNECT_DELAY);
    };

    ws.onerror = (error) => {
      
    };
  };

  useEffect(() => {
    if (connectedWallet && !isExcludedPath(currentPath)) {
      connectWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectedWallet]);

  useEffect(() => {
    (async () => {
      try {
        if (isExcludedPath(currentPath)) {
          return;
        }
        
        setLoader(true);

        try {
          const infraProvidersResponse = await END_POINTS.providers();
          const infraProvidersData = infraProvidersResponse?.data || infraProvidersResponse || [];
          
          if (infraProvidersData?.length > 0) {
            const groupedProviders = groupByPlatformName(infraProvidersData);
            setInfraProviders(groupedProviders);
          } else {
            setInfraProviders([]);
          }
        } catch (error) {
          
          setInfraProviders([]);
        }

        const getnfts = await END_POINTS.list_nfts() as any;

        if (getnfts?.status && getnfts?.nfts?.length > 0) {
          const nftsWithMetadata = getnfts.nfts.map(parseNFTMetadata);

          setNftData(filterNonCompetitionNFTs(nftsWithMetadata));
          setCompNftData({
            'dallas-ai': filterNFTsByCompetition(nftsWithMetadata, 'dallas-ai')
          });
          setAllNftData(nftsWithMetadata.filter(item => item && item.metadata));
          setLoader(false);

          setUsageHistoryLoader(true);

          const nftsWithHistoryResults = await Promise.allSettled(
            nftsWithMetadata.map(async (item: NFTData) => {
              try {
                const usageHistory = await END_POINTS.get_usage_history({ nft: item?.nft }) as any;
                let data = { ...item };

                if (usageHistory?.status && usageHistory?.NFTDataReply?.length > 0) {
                  data = {
                    ...data,
                    usageHistory: usageHistory?.NFTDataReply
                  };
                }

                return data;
              } catch (error) {
                return item;
              }
            })
          );

          const nftsWithHistory = nftsWithHistoryResults
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => (result as PromiseFulfilledResult<NFTData>).value);

          setNftData(filterNonCompetitionNFTs(nftsWithHistory));
          setCompNftData({
            'dallas-ai': filterNFTsByCompetition(nftsWithHistory, 'dallas-ai')
          });
          setAllNftData(nftsWithHistory.filter(item => item && item.metadata));
          setUsageHistoryLoader(false);
        } else {
          setNftData([]);
          setLoader(false);
        }
      } catch (error) {
        
        setLoader(false);
        setUsageHistoryLoader(false);
      }
    })();
  }, []);

  useEffect(() => {
    const storedWallet = loadFromStorage<StoredWalletInterface | null>(STORAGE_KEYS.WALLET_DETAILS, null);

    if (storedWallet) {
      try {
        setConnectedWallet(storedWallet);
        setIsAuthenticated(true);
      } catch (error) {
        
      }
    }
  }, []);

  const connectWallet = useCallback(async (type: WalletType): Promise<void> => {
    const isInstalled = await WalletService.isExtensionInstalled();

    if (!isInstalled) {
      if (type === 'xell') {
        setShowExtensionModal(true);
      }
      return;
    }

    try {
      const result = await WalletService.connect(type);

      if (!result) {
        return;
      }

      saveToStorage(STORAGE_KEYS.WALLET_DETAILS, {
        type: result.type,
        address: result.address
      });
    } catch (error) {
        
    }
  }, []);

  const login = useCallback(async (): Promise<void> => {
    await connectWallet('xell');
  }, [connectWallet]);

  const logout = useCallback(async (): Promise<void> => {
    setIsAuthenticated(false);
    setConnectedWallet(null);
    removeFromStorage(STORAGE_KEYS.WALLET_DETAILS);
  }, []);

  const handleInstallExtension = (): void => {
    window.open('https://chrome.google.com/webstore/detail/aoiajendlccnpnbaabjipmaobbjllijb', '_blank');
    setShowExtensionModal(false);
  };

  const handleReloadPage = (): void => {
    window.location.reload();
    setShowExtensionModal(false);
  };

  const handleCloseModal = (): void => {
    setShowExtensionModal(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      connectWallet,
      connectedWallet,
      setConnectedWallet,
      compNftData,
      allNftData,
      setIsAuthenticated,
      socketRef,
      nftData,
      infraProviders,
      loader,
      setShowExtensionModal,
      showExtensionModal,
      refreshBalance,
      tokenBalance,
      usageHistoryLoader,
      setUsageHistoryLoader
    }}>
      {children}
      <ExtensionModal
        show={showExtensionModal}
        onClose={handleCloseModal}
        onInstallExtension={handleInstallExtension}
        onReloadPage={handleReloadPage}
      />
    </AuthContext.Provider>
  );
}