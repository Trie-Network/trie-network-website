import { WalletType } from '@/services/wallet';
import { NFTData } from './nft';
import { GroupedInfraProvider } from '@/utils/providers';
import { RefObject } from 'react';

export interface ConnectedWallet {
  did: string;
  username: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  
  login: () => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: (type: WalletType) => Promise<void>;
  
  connectedWallet: ConnectedWallet | null;
  setConnectedWallet: (wallet: ConnectedWallet | null) => void;
  
  nftData: NFTData[];
  allNftData: NFTData[];
  compNftData: Record<string, NFTData[]>;
  
  infraProviders: GroupedInfraProvider[];
  
  loader: boolean;
  usageHistoryLoader: boolean;
  
  showExtensionModal: boolean;
  setShowExtensionModal: (show: boolean) => void;
  
  tokenBalance: number;
  refreshBalance: () => Promise<void>;
  
  setIsAuthenticated: (value: boolean) => void;
  setUsageHistoryLoader: (val: boolean) => void;
  
  socketRef: RefObject<WebSocket | null>;
}

export interface AuthError {
  code: 'CONTEXT_MISSING' | 'INVALID_CONTEXT' | 'WALLET_CONNECTION_FAILED' | 'AUTHENTICATION_FAILED';
  message: string;
  details?: string;
  timestamp: string;
}

export interface AuthValidationResult {
  isValid: boolean;
  errors: AuthError[];
  warnings: string[];
}