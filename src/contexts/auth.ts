import { createContext } from 'react';

export interface WalletState {
  did: string;
  username: string;
}

export interface NFTData {
  nft: string;
  metadata: any;
  usageHistory?: any[];
  [key: string]: any;
}

export interface InfraProvider {
  platformName: string;
  platformDescription: string;
  providers: any[];
  [key: string]: any;
}

export interface AuthContextValue {

  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;

  connectedWallet: WalletState | null;
  setConnectedWallet: (wallet: WalletState | null) => void;

  nftData: NFTData[];
  allNftData: NFTData[];
  compNftData: Record<string, NFTData[]>;

  infraProviders: any[];

  loader: boolean;
  usageHistoryLoader: boolean;
  setUsageHistoryLoader: (loading: boolean) => void;

  showExtensionModal: boolean;
  setShowExtensionModal: (show: boolean) => void;

  tokenBalance: number;
  refreshBalance: () => Promise<void>;

  socketRef: React.MutableRefObject<WebSocket | null>;

  [key: string]: any;
}

export const AuthContext = createContext<AuthContextValue | null>(null);