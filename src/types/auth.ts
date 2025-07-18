

export interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  connectWallet: (type: any) => Promise<void>;
  connectedWallet: { type: any; address: string } | null;
}