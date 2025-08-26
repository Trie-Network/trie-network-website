
import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from "react";


export type Network = "MAINNET" | "TESTNET";

interface NetworkContextProps {
  readonly network: Network;
  readonly setNetwork: (network: Network) => void;
  readonly tokenName: string;
  readonly showRequestTokensButton: boolean;
  readonly isMainnet: boolean;
  readonly isTestnet: boolean;
  readonly getNetworkConfig: () => NetworkConfig;
  readonly validateNetwork: (network: Network) => boolean;
  readonly switchNetwork: (network: Network) => void;
}

interface NetworkConfig {
  readonly name: Network;
  readonly tokenName: string;
  readonly showRequestTokensButton: boolean;
  readonly isMainnet: boolean;
  readonly isTestnet: boolean;
  readonly description: string;
  readonly features: readonly string[];
}

interface ProviderProps {
  readonly initialNetwork: Network;
  readonly children: ReactNode;
  readonly onNetworkChange?: (network: Network) => void;
}

interface NetworkMetadata {
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: readonly string[];
  readonly supportedNetworks: readonly Network[];
}

interface NetworkUtility {
  readonly getNetworkMetadata: () => NetworkMetadata;
  readonly validateNetworkConfig: (config: Partial<NetworkConfig>) => boolean;
  readonly createCustomNetwork: (name: string, config: Partial<NetworkConfig>) => any;
  readonly getNetworkStats: () => NetworkStats;
  readonly getNetworkFeatures: (network: Network) => readonly string[];
}

interface NetworkStats {
  readonly totalNetworks: number;
  readonly mainnetCount: number;
  readonly testnetCount: number;
  readonly lastUpdated: string;
}


const NETWORK_METADATA: NetworkMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'dynamic-switching',
    'network-validation',
    'token-management',
    'request-tokens',
    'performance-optimized'
  ],
  supportedNetworks: ['MAINNET', 'TESTNET']
} as const;


const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  MAINNET: {
    name: 'MAINNET',
    tokenName: 'tri',
    showRequestTokensButton: false,
    isMainnet: true,
    isTestnet: false,
    description: 'Main network for production',
    features: ['production', 'real-tokens', 'full-features']
  },
  TESTNET: {
    name: 'TESTNET',
    tokenName: 'trie',
    showRequestTokensButton: true,
    isMainnet: false,
    isTestnet: true,
    description: 'Test network for development',
    features: ['development', 'test-tokens', 'request-tokens']
  }
} as const;


const networkUtils: NetworkUtility = {

  getNetworkMetadata: (): NetworkMetadata => {
    return NETWORK_METADATA;
  },


  validateNetworkConfig: (config: Partial<NetworkConfig>): boolean => {
    if (!config.name || !['MAINNET', 'TESTNET'].includes(config.name)) {
      return false;
    }

    if (!config.tokenName || typeof config.tokenName !== 'string') {
      return false;
    }

    if (typeof config.showRequestTokensButton !== 'boolean') {
      return false;
    }

    return true;
  },


  createCustomNetwork: (name: string, config: Partial<NetworkConfig>): any => {
    
    return {
      name,
      ...config,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
  },


  getNetworkStats: (): NetworkStats => {
    return {
      totalNetworks: Object.keys(NETWORK_CONFIGS).length,
      mainnetCount: 1,
      testnetCount: 1,
      lastUpdated: new Date().toISOString()
    };
  },


  getNetworkFeatures: (network: Network): readonly string[] => {
    return NETWORK_CONFIGS[network]?.features || [];
  }
} as const;


const NetworkContext = createContext<NetworkContextProps | undefined>(undefined);


export const NetworkProvider: React.FC<ProviderProps> = ({ 
  initialNetwork, 
  children, 
  onNetworkChange 
}) => {
  const [network, setNetworkState] = useState<Network>(initialNetwork);


  const currentNetworkConfig = useMemo<NetworkConfig>(() => {
    return NETWORK_CONFIGS[network];
  }, [network]);


  const validatedInitialNetwork = useMemo<Network>(() => {
    if (!networkUtils.validateNetworkConfig({ name: initialNetwork })) {
      
      return 'MAINNET';
    }
    return initialNetwork;
  }, [initialNetwork]);


  const setNetwork = useCallback((newNetwork: Network) => {
    if (!networkUtils.validateNetworkConfig({ name: newNetwork })) {
      
      return;
    }

    setNetworkState(newNetwork);
    onNetworkChange?.(newNetwork);
  }, [onNetworkChange]);


  const switchNetwork = useCallback((newNetwork: Network) => {
    setNetwork(newNetwork);
  }, [setNetwork]);


  const validateNetwork = useCallback((networkToValidate: Network): boolean => {
    return networkUtils.validateNetworkConfig({ name: networkToValidate });
  }, []);


  const getNetworkConfig = useCallback((): NetworkConfig => {
    return currentNetworkConfig;
  }, [currentNetworkConfig]);


  const contextValue = useMemo<NetworkContextProps>(() => ({
    network,
    setNetwork,
    tokenName: currentNetworkConfig.tokenName,
    showRequestTokensButton: currentNetworkConfig.showRequestTokensButton,
    isMainnet: currentNetworkConfig.isMainnet,
    isTestnet: currentNetworkConfig.isTestnet,
    getNetworkConfig,
    validateNetwork,
    switchNetwork
  }), [
    network,
    setNetwork,
    currentNetworkConfig,
    getNetworkConfig,
    validateNetwork,
    switchNetwork
  ]);

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};


export const useNetwork = (): NetworkContextProps => {
  const context = useContext(NetworkContext);
  
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  
  return context;
};


export { 
  networkUtils, 
  NETWORK_METADATA,
  NETWORK_CONFIGS
};


export type { 
  NetworkContextProps, 
  ProviderProps, 
  NetworkConfig, 
  NetworkMetadata, 
  NetworkUtility, 
  NetworkStats 
}; 