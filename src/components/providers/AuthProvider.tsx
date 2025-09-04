import { ReactNode, useRef, useMemo, useReducer } from 'react';
import { AuthContext } from '@/contexts/auth';
import { useState, useCallback, useEffect } from 'react';
import { WalletService, WalletType } from '@/services/wallet';
import { END_POINTS } from '@/api/requests';
import { fetchInferenceBalance } from '@/utils/balanceUtils';
import { WebSocketMessage } from '@/types/ws';
import { deployNFT, transferFT, executeNFT, executeTokens } from '@/services/walletActions';
import { CONSTANTS, API_PORTS } from '@/config/network';
import { STORAGE_KEYS, storageUtils } from '@/constants/storage';
import { useLoader } from '@/contexts/LoaderContext';
import { toast } from 'react-hot-toast';
import ExtensionModal from '@/components/ui/ExtensionModal';


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

import { NFTData } from '@/types/nft';

import { InfraProvider, GroupedInfraProvider, groupByPlatformName } from '@/utils/providers';

// WebSocketMessage type moved to src/types/ws.ts

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

// moved to components/ui/ExtensionModal

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

// layout classes moved with the modal

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

// moved to utils/providers

import { parseNFTMetadata, filterNFTsByCompetition, filterNonCompetitionNFTs } from '@/utils/nft';

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


// ExtensionModal component extracted


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


type AuthState = {
  isAuthenticated: boolean;
  showExtensionModal: boolean;
  connectedWallet: ConnectedWallet | null;
  allNftData: NFTData[];
  infraProviders: GroupedInfraProvider[];
  loader: boolean;
  tokenBalance: number;
  usageHistoryLoader: boolean;
};

type AuthAction =
  | { type: 'SET_AUTH'; payload: boolean }
  | { type: 'SET_EXTENSION_MODAL'; payload: boolean }
  | { type: 'SET_CONNECTED_WALLET'; payload: ConnectedWallet | null }
  | { type: 'SET_ALL_NFTS'; payload: NFTData[] }
  | { type: 'SET_INFRA_PROVIDERS'; payload: GroupedInfraProvider[] }
  | { type: 'SET_LOADER'; payload: boolean }
  | { type: 'SET_TOKEN_BALANCE'; payload: number }
  | { type: 'SET_USAGE_HISTORY_LOADER'; payload: boolean }
  | { type: 'RESET' };

const initialAuthState: AuthState = {
  isAuthenticated: false,
  showExtensionModal: false,
  connectedWallet: null,
  allNftData: [],
  infraProviders: [],
  loader: false,
  tokenBalance: 0,
  usageHistoryLoader: false
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_EXTENSION_MODAL':
      return { ...state, showExtensionModal: action.payload };
    case 'SET_CONNECTED_WALLET':
      return { ...state, connectedWallet: action.payload };
    case 'SET_ALL_NFTS':
      return { ...state, allNftData: action.payload };
    case 'SET_INFRA_PROVIDERS':
      return { ...state, infraProviders: action.payload };
    case 'SET_LOADER':
      return { ...state, loader: action.payload };
    case 'SET_TOKEN_BALANCE':
      return { ...state, tokenBalance: action.payload };
    case 'SET_USAGE_HISTORY_LOADER':
      return { ...state, usageHistoryLoader: action.payload };
    case 'RESET':
      return initialAuthState;
    default:
      return state;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const {
    isAuthenticated,
    showExtensionModal,
    connectedWallet,
    allNftData,
    infraProviders,
    loader,
    tokenBalance,
    usageHistoryLoader
  } = state;
  
  const { 
    setUploadModelLoading, 
    setUploadDatasetLoading, 
    setBuyingAssetLoading, 
    setBuyingTokensLoading 
  } = useLoader();

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
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
      
      dispatch({ type: 'SET_TOKEN_BALANCE', payload: Number(newTrieToken?.ft_count) || 0 });
    } catch (error) {
      
    }
  };

  const connectWebSocket = (): void => {
    if (!connectedWallet?.did || isExcludedPath(currentPath)) return;

    const wsUrl = `${API_PORTS.websocket}?clientID=${connectedWallet.did}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      const initialMessage = {
        type: WEBSOCKET_MESSAGE_TYPES.HELLO,
        clientId: connectedWallet.did,
        timestamp: Date.now(),
      } as const;
      try { ws.send(JSON.stringify(initialMessage)); } catch {}
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
              await deployNFT(
                data?.data?.payload,
                socketRef.current,
                setUploadModelLoading,
                setUploadDatasetLoading
              );
              break;
              
            case WEBSOCKET_ACTIONS.TRANSFER_FT:
              await transferFT(
                data?.data?.payload,
                socketRef.current,
                setUploadModelLoading,
                setUploadDatasetLoading,
                setBuyingTokensLoading,
                triggerAddCreditContract
              );
              break;
              
            case WEBSOCKET_ACTIONS.EXECUTE_NFT:
              await executeNFT(
                data?.data?.payload,
                socketRef.current,
                setBuyingAssetLoading
              );
              break;
              
            case WEBSOCKET_ACTIONS.EXECUTE_TOKENS:
              await executeTokens(
                data?.data?.payload,
                socketRef.current,
                setBuyingTokensLoading,
                connectedWallet?.did,
                refreshBalance,
                BALANCE_REFRESH_DELAY
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
      if (!isMountedRef.current) return;
      const attempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = attempt;
      const base = 250;
      const max = 8000;
      const jitter = Math.floor(Math.random() * 200);
      const delay = Math.min(base * Math.pow(2, attempt), max) + jitter;
      setTimeout(() => {
        if (isMountedRef.current && connectedWallet?.did && !isExcludedPath(currentPath)) {
          connectWebSocket();
        }
      }, delay);
    };

    ws.onerror = () => {
      try { ws.close(); } catch {}
    };
  };

  useEffect(() => {
    isMountedRef.current = true;
    if (connectedWallet && !isExcludedPath(currentPath)) {
      connectWebSocket();
    }

    return () => {
      isMountedRef.current = false;
      if (socketRef.current) {
        try { socketRef.current.close(); } catch {}
      }
    };
  }, [connectedWallet, currentPath]);

  useEffect(() => {
    (async () => {
      try {
        if (isExcludedPath(currentPath)) {
          return;
        }
        
        dispatch({ type: 'SET_LOADER', payload: true });

        try {
          const infraProvidersResponse = await END_POINTS.providers();
          const infraProvidersData = infraProvidersResponse?.data || infraProvidersResponse || [];
          
          if (infraProvidersData?.length > 0) {
            const groupedProviders = groupByPlatformName(infraProvidersData);
            dispatch({ type: 'SET_INFRA_PROVIDERS', payload: groupedProviders });
          } else {
            dispatch({ type: 'SET_INFRA_PROVIDERS', payload: [] });
          }
        } catch (error) {
          
          dispatch({ type: 'SET_INFRA_PROVIDERS', payload: [] });
        }

        const getnfts = await END_POINTS.list_nfts() as any;

        if (getnfts?.status && getnfts?.nfts?.length > 0) {
          const nftsWithMetadata = getnfts.nfts.map(parseNFTMetadata);

          dispatch({ type: 'SET_ALL_NFTS', payload: nftsWithMetadata.filter(item => item && item.metadata) });
          dispatch({ type: 'SET_LOADER', payload: false });

          dispatch({ type: 'SET_USAGE_HISTORY_LOADER', payload: true });

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

          dispatch({ type: 'SET_ALL_NFTS', payload: nftsWithHistory.filter(item => item && item.metadata) });
          dispatch({ type: 'SET_USAGE_HISTORY_LOADER', payload: false });
        } else {
          dispatch({ type: 'SET_ALL_NFTS', payload: [] });
          dispatch({ type: 'SET_LOADER', payload: false });
        }
      } catch (error) {
        
        dispatch({ type: 'SET_LOADER', payload: false });
        dispatch({ type: 'SET_USAGE_HISTORY_LOADER', payload: false });
      }
    })();
  }, []);

  useEffect(() => {
    const storedWallet = loadFromStorage<StoredWalletInterface | null>(STORAGE_KEYS.WALLET_DETAILS, null);

    if (storedWallet) {
      try {
        dispatch({ type: 'SET_CONNECTED_WALLET', payload: storedWallet });
        dispatch({ type: 'SET_AUTH', payload: true });
      } catch (error) {
        
      }
    }
  }, []);

  const connectWallet = useCallback(async (type: WalletType): Promise<void> => {
    const isInstalled = await WalletService.isExtensionInstalled();

    if (!isInstalled) {
      if (type === 'xell') {
        dispatch({ type: 'SET_EXTENSION_MODAL', payload: true });
      }
      return;
    }

    try {
      const result = await WalletService.connect(type);

      if (!result) {
        return;
      }

      const did = result.address;
      const username = result.username || '';
      const wallet: StoredWalletInterface = { did, username };

      dispatch({ type: 'SET_CONNECTED_WALLET', payload: wallet });
      dispatch({ type: 'SET_AUTH', payload: true });
      saveToStorage(STORAGE_KEYS.WALLET_DETAILS, wallet);
    } catch (error) {
        
    }
  }, []);

  const login = useCallback(async (): Promise<void> => {
    await connectWallet('xell');
  }, [connectWallet]);

  const logout = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_AUTH', payload: false });
    dispatch({ type: 'SET_CONNECTED_WALLET', payload: null });
    removeFromStorage(STORAGE_KEYS.WALLET_DETAILS);
  }, []);

  const handleInstallExtension = (): void => {
    window.open('https://chrome.google.com/webstore/detail/aoiajendlccnpnbaabjipmaobbjllijb', '_blank');
    dispatch({ type: 'SET_EXTENSION_MODAL', payload: false });
  };

  const handleReloadPage = (): void => {
    window.location.reload();
    dispatch({ type: 'SET_EXTENSION_MODAL', payload: false });
  };

  const handleCloseModal = (): void => {
    dispatch({ type: 'SET_EXTENSION_MODAL', payload: false });
  };

  const nftData = useMemo(() => filterNonCompetitionNFTs(allNftData), [allNftData]);
  const compNftData = useMemo(() => ({ 'dallas-ai': filterNFTsByCompetition(allNftData, 'dallas-ai') }), [allNftData]);

  const setIsAuthenticated = (value: boolean) => dispatch({ type: 'SET_AUTH', payload: value });
  const setConnectedWallet = (wallet: ConnectedWallet | null) => dispatch({ type: 'SET_CONNECTED_WALLET', payload: wallet });
  const setShowExtensionModal = (show: boolean) => dispatch({ type: 'SET_EXTENSION_MODAL', payload: show });
  const setUsageHistoryLoader = (val: boolean) => dispatch({ type: 'SET_USAGE_HISTORY_LOADER', payload: val });

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