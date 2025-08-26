
import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { isMainnet } from '@/config/network';


interface TokenNameContextType {
  readonly tokenName: string;
  readonly isMainnetToken: boolean;
  readonly isTestnetToken: boolean;
  readonly getTokenInfo: () => TokenInfo;
  readonly validateTokenName: (name: string) => boolean;
  readonly getTokenMetadata: () => TokenMetadata;
}

interface TokenInfo {
  readonly name: string;
  readonly symbol: string;
  readonly network: 'mainnet' | 'testnet';
  readonly description: string;
  readonly features: readonly string[];
}

interface TokenNameProviderProps {
  readonly children: ReactNode;
  readonly customTokenName?: string;
  readonly overrideNetwork?: boolean;
}

interface TokenMetadata {
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: readonly string[];
  readonly supportedTokens: readonly string[];
}

interface TokenUtility {
  readonly getTokenMetadata: () => TokenMetadata;
  readonly validateTokenConfig: (config: Partial<TokenInfo>) => boolean;
  readonly createCustomToken: (name: string, config: Partial<TokenInfo>) => any;
  readonly getTokenStats: () => TokenStats;
  readonly getTokenFeatures: (tokenName: string) => readonly string[];
}

interface TokenStats {
  readonly totalTokens: number;
  readonly mainnetTokens: number;
  readonly testnetTokens: number;
  readonly lastUpdated: string;
}


const TOKEN_METADATA: TokenMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'network-aware',
    'dynamic-resolution',
    'token-validation',
    'performance-optimized',
    'type-safe'
  ],
  supportedTokens: ['tri', 'trie']
} as const;


const TOKEN_CONFIGS: Record<string, TokenInfo> = {
  tri: {
    name: 'tri',
    symbol: 'TRI',
    network: 'mainnet',
    description: 'Main network token for production',
    features: ['production', 'real-value', 'full-features']
  },
  trie: {
    name: 'trie',
    symbol: 'TRIE',
    network: 'testnet',
    description: 'Test network token for development',
    features: ['development', 'test-value', 'request-tokens']
  }
} as const;


const tokenUtils: TokenUtility = {

  getTokenMetadata: (): TokenMetadata => {
    return TOKEN_METADATA;
  },


  validateTokenConfig: (config: Partial<TokenInfo>): boolean => {
    if (!config.name || typeof config.name !== 'string') {
      return false;
    }

    if (!config.symbol || typeof config.symbol !== 'string') {
      return false;
    }

    if (!config.network || !['mainnet', 'testnet'].includes(config.network)) {
      return false;
    }

    return true;
  },


  createCustomToken: (name: string, config: Partial<TokenInfo>): any => {
   
    return {
      name,
      ...config,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
  },


  getTokenStats: (): TokenStats => {
    return {
      totalTokens: Object.keys(TOKEN_CONFIGS).length,
      mainnetTokens: 1,
      testnetTokens: 1,
      lastUpdated: new Date().toISOString()
    };
  },


  getTokenFeatures: (tokenName: string): readonly string[] => {
    return TOKEN_CONFIGS[tokenName]?.features || [];
  }
} as const;


const getTokenName = (): string => {
  return isMainnet ? "tri" : "trie";
};


const TokenNameContext = createContext<TokenNameContextType | undefined>(undefined);


export const TokenNameProvider: React.FC<TokenNameProviderProps> = ({ 
  children, 
  customTokenName,
  overrideNetwork = false 
}) => {

  const tokenName = useMemo<string>(() => {
    if (customTokenName && overrideNetwork) {
      return customTokenName;
    }
    return getTokenName();
  }, [customTokenName, overrideNetwork]);


  const tokenInfo = useMemo<TokenInfo>(() => {
    const config = TOKEN_CONFIGS[tokenName];
    if (!config) {

      return {
        name: tokenName,
        symbol: tokenName.toUpperCase(),
        network: isMainnet ? 'mainnet' : 'testnet',
        description: `Custom token: ${tokenName}`,
        features: ['custom', 'fallback']
      };
    }
    return config;
  }, [tokenName]);


  const validateTokenName = useMemo(() => (name: string): boolean => {
    return typeof name === 'string' && name.length > 0;
  }, []);

  
  const getTokenMetadata = useMemo(() => (): TokenMetadata => {
    return TOKEN_METADATA;
  }, []);

  
  const contextValue = useMemo<TokenNameContextType>(() => ({
    tokenName,
    isMainnetToken: tokenInfo.network === 'mainnet',
    isTestnetToken: tokenInfo.network === 'testnet',
    getTokenInfo: () => tokenInfo,
    validateTokenName,
    getTokenMetadata
  }), [
    tokenName,
    tokenInfo,
    validateTokenName,
    getTokenMetadata
  ]);

  return (
    <TokenNameContext.Provider value={contextValue}>
      {children}
    </TokenNameContext.Provider>
  );
};


export const useTokenNameEnhanced = (): TokenNameContextType => {
  const context = useContext(TokenNameContext);
  
  if (!context) {
    throw new Error('useTokenNameEnhanced must be used within a TokenNameProvider');
  }
  
  return context;
};


export const useTokenName = (): string => {
  const context = useContext(TokenNameContext);
  
  if (!context) {
    
    return getTokenName();
  }
  
  return context.tokenName;
};


export { 
  tokenUtils, 
  TOKEN_METADATA,
  TOKEN_CONFIGS,
  getTokenName
};


export type { 
  TokenNameContextType, 
  TokenNameProviderProps, 
  TokenInfo, 
  TokenMetadata, 
  TokenUtility, 
  TokenStats 
}; 