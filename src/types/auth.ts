import { WalletType } from '@/services/wallet';

export interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  connectWallet: (type: WalletType) => Promise<void>;
  connectedWallet: { type: WalletType; address: string } | null;
}