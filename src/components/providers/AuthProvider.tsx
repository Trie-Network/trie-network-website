import { ReactNode, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext, WalletState, NFTData, InfraProvider } from '@/contexts/auth';
import { END_POINTS } from '@/api/requests';
import { X } from 'lucide-react';
import { CONSTANTS } from '@/utils';

const STORAGE_KEY = 'wallet_details';

interface AuthProviderProps {
  children: ReactNode;
}

interface StoredWalletInterface {
  did: string;
  username: string;
}

interface GroupedProvider {
  name: string;
  description: string;
  providers: InfraProvider[];
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletState | null>(null);
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [allNftData, setAllNftData] = useState<NFTData[]>([]);
  const [infraProviders, setInfraProviders] = useState<GroupedProvider[]>([]);
  const [compNftData, setCompNftData] = useState<Record<string, NFTData[]>>({});
  const [loader, setLoader] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [usageHistoryLoader, setUsageHistoryLoader] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const path = useMemo(() => window?.location?.pathname, []);

  const refreshBalance = useCallback(async () => {
    try {
      if (!connectedWallet?.did) {
        return;
      }

      const getTokenCount = await END_POINTS.get_ft_info_by_did({ did: connectedWallet.did }) as any;
      if (!getTokenCount?.status || getTokenCount?.ft_info?.length < 1) {
        return;
      }

      const newTrieToken = getTokenCount.ft_info.find(
        (item: any) => item?.creator_did === CONSTANTS.FT_DENOM_CREATOR
      );

      if (!newTrieToken) {
        return;
      }

      setTokenBalance(parseFloat(newTrieToken?.ft_count || 0) || 0);
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  }, [connectedWallet?.did]);

  const groupByPlatformName = useCallback((infraProviders: InfraProvider[]): GroupedProvider[] => {
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
    }, {} as Record<string, GroupedProvider>);

    return Object.values(grouped);
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!connectedWallet?.did) return;

    const wsUrl = `wss://dev-api.xellwallet.com:8443/ws?clientID=${connectedWallet.did}`;
    console.log(`Connecting to WebSocket at ${wsUrl}...`);

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established!');

      const initialMessage = {
        type: 'hello',
        clientId: "client-124",
        timestamp: Date.now(),
      };
      ws.send(JSON.stringify(initialMessage));
      console.log('Sent initial message:', initialMessage);
    };

    ws.onmessage = (event) => {
      try {
        const actions = ["DEPLOY_NFT", "TRANSFER_FT", "EXECUTE_NFT"];
        const data = JSON.parse(event.data);
        console.log(data, 'Received message:');

        if (data?.type === "OPEN_EXTENSION" && actions.includes(data?.data?.action)) {
          window.myExtension.trigger({
            type: data?.data?.action,
            data: data?.data?.payload
          });
        }
      } catch (e) {
        console.log('Received non-JSON message:', event.data);
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket connection closed: Code ${event.code}`);
      setTimeout(connectWebSocket, 100);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [connectedWallet?.did]);

  const fetchNFTData = useCallback(async () => {
    try {
      const excludedPaths = ["/faucet", "/faucet/"];
      if (excludedPaths.includes(path)) {
        return;
      }

      setLoader(true);

      const infraProvidersData = await END_POINTS.providers() as any;
      if (infraProvidersData?.length > 0) {
        setInfraProviders(groupByPlatformName(infraProvidersData));
      }

      const getnfts = await END_POINTS.list_nfts() as any;

      if (getnfts?.status && getnfts?.nfts?.length > 0) {
        const nftsWithMetadata = getnfts.nfts.map((item: any) => {
          try {
            return {
              ...item,
              metadata: JSON.parse(item?.nft_metadata || '{}')
            };
          } catch (error) {
            console.error('Error parsing metadata:', error);
            return {
              ...item,
              metadata: {}
            };
          }
        });

        const filteredNfts = nftsWithMetadata.filter((item: any) =>
          item && item?.metadata && !item?.metadata?.compId
        ).reverse();

        const competitionNfts = nftsWithMetadata.filter((item: any) =>
          item && item?.metadata?.compId === 'dallas-ai'
        );

        setNftData(filteredNfts);
        setCompNftData({ 'dallas-ai': competitionNfts });
        setAllNftData(nftsWithMetadata.filter((item: any) => item && item?.metadata));
        setLoader(false);

        setUsageHistoryLoader(true);

        const nftsWithHistoryResults = await Promise.allSettled(
          nftsWithMetadata.map(async (item: any) => {
            try {
              const usageHistory = await END_POINTS.get_usage_history({ nft: item?.nft }) as any;

              if (usageHistory?.status && usageHistory?.NFTDataReply?.length > 0) {
                return {
                  ...item,
                  usageHistory: usageHistory.NFTDataReply
                };
              }

              return item;
            } catch (error) {
              console.error('Error fetching usage history for NFT:', item?.nft, error);
              return item;
            }
          })
        );

        const nftsWithHistory = nftsWithHistoryResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => (result as PromiseFulfilledResult<any>).value);

        const filteredNftsWithHistory = nftsWithHistory.filter((item: any) =>
          item && item?.metadata && !item?.metadata?.compId
        ).reverse();

        const competitionNftsWithHistory = nftsWithHistory.filter((item: any) =>
          item && item?.metadata?.compId === 'dallas-ai'
        );

        setNftData(filteredNftsWithHistory);
        setCompNftData({ 'dallas-ai': competitionNftsWithHistory });
        setAllNftData(nftsWithHistory.filter((item: any) => item && item?.metadata));
        setUsageHistoryLoader(false);
      } else {
        setNftData([]);
        setLoader(false);
      }
    } catch (error) {
      console.error('Error in NFT fetching process:', error);
      setLoader(false);
      setUsageHistoryLoader(false);
    }
  }, [path, groupByPlatformName]);

  useEffect(() => {
    const excludedPaths = ["/faucet", "/faucet/"];
    if (connectedWallet && !excludedPaths.includes(path)) {
      connectWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectedWallet, path, connectWebSocket]);

  useEffect(() => {
    fetchNFTData();
  }, [fetchNFTData]);

  useEffect(() => {
    try {
      const storedWallet = localStorage.getItem(STORAGE_KEY);
      if (storedWallet) {
        const parsedWallet = JSON.parse(storedWallet) as StoredWalletInterface;
        setConnectedWallet(parsedWallet);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to parse stored wallet:', error);
    }
  }, []);

  const handleInstallExtension = useCallback(() => {
    window.open('https://chrome.google.com/webstore/detail/aoiajendlccnpnbaabjipmaobbjllijb', '_blank');
    setShowExtensionModal(false);
  }, []);

  const handleReloadPage = useCallback(() => {
    window.location.reload();
    setShowExtensionModal(false);
  }, []);

  const onClose = useCallback(() => {
    setShowExtensionModal(false);
  }, []);

  const contextValue = useMemo(() => ({
    isAuthenticated,
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
  }), [
    isAuthenticated,
    connectedWallet,
    compNftData,
    allNftData,
    nftData,
    infraProviders,
    loader,
    showExtensionModal,
    refreshBalance,
    tokenBalance,
    usageHistoryLoader
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {showExtensionModal &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-bold font-['IBM_Plex_Sans']">
                Wallet Connection Issue
              </h3>
              <p className="text-gray-300 mt-2 font-['IBM_Plex_Sans']">
                There seems to be an issue with the XELL wallet connection. You may need to install the extension or reload the page to continue.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleInstallExtension}
                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors font-['IBM_Plex_Sans']"
              >
                Install Extension
              </button>

              <button
                onClick={handleReloadPage}
                className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors font-['IBM_Plex_Sans']"
              >
                Reload Page
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 bg-transparent border border-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors font-['IBM_Plex_Sans']"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>}

    </AuthContext.Provider>
  );
}