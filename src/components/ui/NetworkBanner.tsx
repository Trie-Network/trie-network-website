

/// <reference types="vite/client" />

import { AlertTriangle } from 'lucide-react';
import { CURRENT_NETWORK, Network } from '@/config/network';

interface NetworkBannerProps {
  className?: string;
  customMainnetUrl?: string;
  customBannerText?: string;
  customLinkText?: string;
}

interface BannerContentProps {
  bannerText: string;
  linkText: string;
  targetUrl: string;
  className?: string;
}

interface WarningIconProps {
  className?: string;
}


const NETWORK_BANNER_CLASSES = {
  container: 'fixed top-0 left-0 right-0 z-30 bg-cyan-50 text-cyan-800 text-center py-2 text-sm font-medium',
  content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center',
  link: 'underline hover:text-cyan-600',
  warningIcon: 'w-4 h-4 mr-2'
} as const;

const NETWORK_BANNER_DEFAULT_CONFIG = {
  defaultMainnetUrl: 'https://www.trie.network',
  defaultBannerText: 'You are on the Testnet. Switch to',
  defaultLinkText: 'Mainnet',
  defaultClassName: '',
  zIndex: 30
} as const;

const NETWORK_BANNER_CONFIG = {
  mainnetNetwork: Network.MAINNET,
  testnetNetworks: [Network.TESTNET]
} as const;


const networkBannerUtils = {
  
  isTestnet: (): boolean => {
    return CURRENT_NETWORK !== NETWORK_BANNER_CONFIG.mainnetNetwork;
  },

  
  getMainnetUrl: (customUrl?: string): string => {
    return customUrl || NETWORK_BANNER_DEFAULT_CONFIG.defaultMainnetUrl;
  },

  
  getBannerText: (customText?: string): string => {
    return customText || NETWORK_BANNER_DEFAULT_CONFIG.defaultBannerText;
  },

  
  getLinkText: (customText?: string): string => {
    return customText || NETWORK_BANNER_DEFAULT_CONFIG.defaultLinkText;
  },

  
  getContainerClasses: (className: string): string => {
    return `${NETWORK_BANNER_CLASSES.container} ${className}`.trim();
  },

  
  getContentClasses: (className: string): string => {
    return `${NETWORK_BANNER_CLASSES.content} ${className}`.trim();
  },

  
  getLinkClasses: (className: string): string => {
    return `${NETWORK_BANNER_CLASSES.link} ${className}`.trim();
  },

  
  getWarningIconClasses: (className: string): string => {
    return `${NETWORK_BANNER_CLASSES.warningIcon} ${className}`.trim();
  },

  
  validateProps: (props: NetworkBannerProps): boolean => {
    return (
      (props.className === undefined || typeof props.className === 'string') &&
      (props.customMainnetUrl === undefined || typeof props.customMainnetUrl === 'string') &&
      (props.customBannerText === undefined || typeof props.customBannerText === 'string') &&
      (props.customLinkText === undefined || typeof props.customLinkText === 'string')
    );
  },

  
  handleLinkClick: (url: string): void => {
   
  }
} as const;


const WarningIcon: React.FC<WarningIconProps> = ({ className = '' }) => (
  <AlertTriangle className={networkBannerUtils.getWarningIconClasses(className)} />
);

const BannerContent: React.FC<BannerContentProps> = ({ 
  bannerText, 
  linkText, 
  targetUrl, 
  className = '' 
}) => (
  <div className={networkBannerUtils.getContentClasses(className)}>
    <WarningIcon />
    <span>
      {bannerText}{' '}
      <a 
        href={targetUrl} 
        className={networkBannerUtils.getLinkClasses('')}
        onClick={() => networkBannerUtils.handleLinkClick(targetUrl)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {linkText}
      </a>
      .
    </span>
  </div>
);


export function NetworkBanner({ 
  className = NETWORK_BANNER_DEFAULT_CONFIG.defaultClassName,
  customMainnetUrl,
  customBannerText,
  customLinkText
}: NetworkBannerProps) {
  
  if (!networkBannerUtils.validateProps({ className, customMainnetUrl, customBannerText, customLinkText })) {
    // NetworkBanner: Invalid props provided
    return null;
  }

  
  if (!networkBannerUtils.isTestnet()) {
    return null;
  }

  
  const mainnetUrl = networkBannerUtils.getMainnetUrl(customMainnetUrl);
  const bannerText = networkBannerUtils.getBannerText(customBannerText);
  const linkText = networkBannerUtils.getLinkText(customLinkText);

  return (
    <div className={networkBannerUtils.getContainerClasses(className)}>
      <BannerContent 
        bannerText={bannerText}
        linkText={linkText}
        targetUrl={mainnetUrl}
      />
    </div>
  );
}


export type { 
  NetworkBannerProps, 
  BannerContentProps, 
  WarningIconProps 
};


export { 
  NETWORK_BANNER_CLASSES, 
  NETWORK_BANNER_DEFAULT_CONFIG, 
  NETWORK_BANNER_CONFIG, 
  networkBannerUtils 
}; 