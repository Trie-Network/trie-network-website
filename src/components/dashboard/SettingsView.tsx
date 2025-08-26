import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';


interface SettingsViewProps {
  primaryColor?: string;
}

interface ConnectedWallet {
  did: string;
}

interface WalletConnectionProps {
  connectedWallet: ConnectedWallet | null;
  onConnect: () => void;
}

interface WalletDetailsProps {
  connectedWallet: ConnectedWallet;
  copied: boolean;
  onCopy: () => void;
}

interface WalletCardProps {
  connectedWallet: ConnectedWallet | null;
}

interface LoadingSkeletonProps {
  type: 'header' | 'wallet';
}

interface CopyButtonProps {
  copied: boolean;
  onCopy: () => void;
}


const LOADING_DURATION = 1500;
const COPY_RESET_DELAY = 1500;
const TOAST_DURATION = 1000;

const LAYOUT_CLASSES = {
  container: 'max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-112px)] overflow-y-auto scrollbar-hide',
  connectContainer: 'flex items-center justify-center h-[calc(100vh-112px)]',
  connectContent: 'text-center',
  connectIcon: 'w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6',
  connectImage: 'w-8 h-8',
  connectTitle: 'text-xl font-semibold text-gray-900 mb-2',
  connectDescription: 'text-gray-600 mb-6',
  connectButton: 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0284a5] hover:bg-[#026d8a]',
  header: 'text-2xl font-bold text-gray-900 mb-8',
  walletSection: 'bg-white rounded-xl shadow-sm border border-[#e1e3e5] p-6 mb-8',
  walletTitle: 'text-lg font-semibold text-gray-900 mb-6',
  walletContent: 'space-y-6',
  walletConnection: 'space-y-4',
  connectionLabel: 'block text-sm font-medium text-gray-700 mb-2',
  walletCard: 'flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer',
  walletInfo: 'flex items-center gap-4',
  walletIcon: 'w-12 h-12 bg-white rounded-full p-2 shadow-sm',
  walletIconImage: 'w-full h-full object-contain',
  walletDetails: 'text-sm font-medium text-gray-900',
  walletDescription: 'text-xs text-gray-500',
  statusConnected: 'text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full',
  statusDisconnected: 'text-xs font-medium text-gray-600',
  walletDetailsSection: 'border-t border-gray-100 pt-4',
  detailsContainer: 'flex items-center justify-between',
  detailsInfo: 'text-sm font-medium text-gray-900',
  detailsAddress: 'flex',
  addressText: 'text-xs font-mono text-gray-500 me-3',
  statusIndicator: 'flex items-center gap-2',
  statusDot: 'flex w-2 h-2 bg-green-500 rounded-full',
  statusText: 'text-xs text-gray-500'
} as const;

const SKELETON_CLASSES = {
  header: 'w-48 h-8 mb-8',
  walletTitle: 'w-32 h-6 mb-6',
  walletContent: 'space-y-6',
  connectionLabel: 'w-48 h-4 mb-2',
  walletCard: 'flex items-center justify-between p-4 bg-gray-50 rounded-lg',
  walletIcon: 'w-12 h-12 rounded-full',
  walletInfo: 'flex items-center gap-4',
  walletTitleSkeleton: 'w-32 h-4 mb-2',
  walletDescriptionSkeleton: 'w-48 h-3',
  walletButton: 'w-24 h-8',
  detailsLabel: 'w-40 h-4 mb-2',
  detailsInput: 'w-full h-10',
  detailsDescription: 'w-64 h-4 mt-2'
} as const;

const WALLET_CONFIG = {
  name: 'XELL',
  description: 'Recommended wallet for TRIE AI Marketplace',
  iconPath: '/xell.png',
  altText: 'XELL'
} as const;


const simulateLoading = (duration: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};

const triggerWalletConnection = (): void => {
  if (window.xell) {
    window.xell.trigger({
      type: "WALLET_SIGN_REQUEST",
      data: {}
    });
  }
};

const showSuccessToast = (message: string, duration: number): void => {
  toast.success(message, { duration });
};

const formatWalletAddress = (address: string): string => {
  return address || '';
};

const isWalletConnected = (wallet: ConnectedWallet | null): boolean => {
  return !!wallet?.did;
};


const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type }) => {
  if (type === 'header') {
    return <Skeleton className={SKELETON_CLASSES.header} />;
  }

  return (
    <>
      <Skeleton className={SKELETON_CLASSES.walletTitle} />
      <div className={SKELETON_CLASSES.walletContent}>
        <div className={LAYOUT_CLASSES.walletConnection}>
          <Skeleton className={SKELETON_CLASSES.connectionLabel} />
          <div className={SKELETON_CLASSES.walletCard}>
            <div className={SKELETON_CLASSES.walletInfo}>
              <Skeleton className={SKELETON_CLASSES.walletIcon} />
              <div>
                <Skeleton className={SKELETON_CLASSES.walletTitleSkeleton} />
                <Skeleton className={SKELETON_CLASSES.walletDescriptionSkeleton} />
              </div>
            </div>
            <Skeleton className={SKELETON_CLASSES.walletButton} />
          </div>
        </div>
        <div>
          <Skeleton className={SKELETON_CLASSES.detailsLabel} />
          <Skeleton className={SKELETON_CLASSES.detailsInput} />
          <Skeleton className={SKELETON_CLASSES.detailsDescription} />
        </div>
      </div>
    </>
  );
};

const CopyButton: React.FC<CopyButtonProps> = ({ copied, onCopy }) => {
  return copied ? (
    <Check color='gray' size={18} />
  ) : (
    <Copy color='gray' className='cursor-pointer' onClick={onCopy} size={18} />
  );
};

const WalletCard: React.FC<WalletCardProps> = ({ connectedWallet }) => {
  return (
    <div className={LAYOUT_CLASSES.walletCard}>
      <div className={LAYOUT_CLASSES.walletInfo}>
        <div className={LAYOUT_CLASSES.walletIcon}>
          <img 
            src={WALLET_CONFIG.iconPath} 
            alt={WALLET_CONFIG.altText} 
            className={LAYOUT_CLASSES.walletIconImage} 
          />
        </div>
        <div>
          <h3 className={LAYOUT_CLASSES.walletDetails}>{WALLET_CONFIG.name}</h3>
          <p className={LAYOUT_CLASSES.walletDescription}>{WALLET_CONFIG.description}</p>
        </div>
      </div>
      {isWalletConnected(connectedWallet) ? (
        <span className={LAYOUT_CLASSES.statusConnected}>Connected</span>
      ) : (
        <span className={LAYOUT_CLASSES.statusDisconnected}>Connect</span>
      )}
    </div>
  );
};

const WalletDetails: React.FC<WalletDetailsProps> = ({ connectedWallet, copied, onCopy }) => {
  return (
    <div className={LAYOUT_CLASSES.walletDetailsSection}>
      <div className={LAYOUT_CLASSES.detailsContainer}>
        <div>
          <p className={LAYOUT_CLASSES.detailsInfo}>Connected Address</p>
          <div className={LAYOUT_CLASSES.detailsAddress}>
            <p className={LAYOUT_CLASSES.addressText}>
              {formatWalletAddress(connectedWallet.did)}
            </p>
            <CopyButton copied={copied} onCopy={onCopy} />
          </div>
        </div>
        <div className={LAYOUT_CLASSES.statusIndicator}>
          <span className={LAYOUT_CLASSES.statusDot}></span>
          <span className={LAYOUT_CLASSES.statusText}>Active</span>
        </div>
      </div>
    </div>
  );
};

const WalletConnection: React.FC<WalletConnectionProps> = ({ connectedWallet, onConnect }) => {
  return (
    <div className={LAYOUT_CLASSES.walletConnection}>
      <label className={LAYOUT_CLASSES.connectionLabel}>
        Wallet Connection
      </label>
      <WalletCard connectedWallet={connectedWallet} />
    </div>
  );
};

const ConnectWalletPrompt: React.FC<{ onConnect: () => void }> = ({ onConnect }) => {
  return (
    <div className={LAYOUT_CLASSES.connectContainer}>
      <div className={LAYOUT_CLASSES.connectContent}>
        <div className={LAYOUT_CLASSES.connectIcon}>
          <img src={WALLET_CONFIG.iconPath} alt={WALLET_CONFIG.altText} className={LAYOUT_CLASSES.connectImage} />
        </div>
        <h3 className={LAYOUT_CLASSES.connectTitle}>Connect Your Wallet</h3>
        <p className={LAYOUT_CLASSES.connectDescription}>
          Please connect your XELL wallet to access settings
        </p>
        <button
          onClick={onConnect}
          className={LAYOUT_CLASSES.connectButton}
        >
          Connect XELL Wallet
        </button>
      </div>
    </div>
  );
};


export function SettingsView({ primaryColor }: SettingsViewProps = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const { setIsAuthenticated, connectedWallet, setConnectedWallet, setShowExtensionModal } = useAuth();
  const [copied, setCopied] = useState(false);
  const messageHandlerRef = useRef<any>(null);

  const handleConnectWallet = (): void => {
    triggerWalletConnection();
    if (!window.xell) {
      setShowExtensionModal(true);
    }
  };

  const handleCopy = async (): Promise<void> => {
    const success = await copyToClipboard(connectedWallet?.did || '');
    if (success) {
      setCopied(true);
      showSuccessToast("DID copied", TOAST_DURATION);
      setTimeout(() => setCopied(false), COPY_RESET_DELAY);
    }
  };

  
  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      await simulateLoading(LOADING_DURATION);
      setIsLoading(false);
    };

    loadSettings();
  }, []);

  if (!isWalletConnected(connectedWallet)) {
    return <ConnectWalletPrompt onConnect={handleConnectWallet} />;
  }

  return (
    <div className={LAYOUT_CLASSES.container}>
      {isLoading ? (
        <LoadingSkeleton type="header" />
      ) : (
        <h1 className={LAYOUT_CLASSES.header}>Settings</h1>
      )}

      
      <div className={LAYOUT_CLASSES.walletSection}>
        {isLoading ? (
          <LoadingSkeleton type="wallet" />
        ) : (
          <>
            <h2 className={LAYOUT_CLASSES.walletTitle}>Wallet</h2>
            <div className={LAYOUT_CLASSES.walletContent}>
              <WalletConnection 
                connectedWallet={connectedWallet} 
                onConnect={handleConnectWallet} 
              />

              {isWalletConnected(connectedWallet) && (
                <WalletDetails 
                  connectedWallet={connectedWallet} 
                  copied={copied} 
                  onCopy={handleCopy} 
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}