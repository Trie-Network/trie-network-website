
/// <reference types="vite/client" />


interface NetworkConfig {
  readonly MAINNET: 'mainnet';
  readonly TESTNET: 'testnet';
}

interface NetworkState {
  readonly currentNetwork: string;
  readonly isMainnet: boolean;
  readonly isTestnet: boolean;
  readonly tokenName: string;
  readonly showRequestTokensButton: boolean;
}

interface ContractAddresses {
  readonly CONTRACT_TOKEN: string;
  readonly BUY_TOKEN: string;
  readonly RATING_TOKEN: string;
  readonly INFERENCE_CONTRACT: string;
  readonly FT_DENOM_CREATOR: string;
  readonly FT_DENOM: string;
  readonly TOPUP_TOKEN: string;
}

interface ApiEndpoints {
  readonly node: string;
  readonly dapp: string;
  readonly faucet: string;
  readonly metrics: string;
  readonly comp: string;
  readonly websocket: string;
  readonly explorer: string;
}

interface NetworkConstants {
  readonly contracts: ContractAddresses;
  readonly api: ApiEndpoints;
  readonly validation: {
    readonly requiredEnvVars: readonly string[];
    readonly supportedNetworks: readonly string[];
    readonly maxRetries: number;
    readonly timeoutMs: number;
  };
}

interface NetworkUtility {
  readonly getCurrentNetwork: () => string;
  readonly isMainnet: () => boolean;
  readonly isTestnet: () => boolean;
  readonly getTokenName: () => string;
  readonly shouldShowRequestTokens: () => boolean;
  readonly getContractAddress: (contractName: keyof ContractAddresses) => string;
  readonly getApiEndpoint: (serviceName: keyof ApiEndpoints) => string;
  readonly validateNetworkConfig: () => boolean;
  readonly getNetworkInfo: () => NetworkInfo;
  readonly getNetworkState: () => NetworkState;
  readonly createCustomNetworkConfig: (customNetwork: string, customConfig: Partial<ContractAddresses & ApiEndpoints>) => any;
}

interface NetworkInfo {
  readonly network: string;
  readonly environment: 'production' | 'development' | 'test';
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: {
    readonly faucet: boolean;
    readonly competitions: boolean;
    readonly mainnetFeatures: boolean;
  };
}


const NETWORK_CONFIG: NetworkConfig = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet'
} as const;

const NETWORK_VALIDATION = {
  requiredEnvVars: ['VITE_NETWORK'] as const,
  supportedNetworks: ['mainnet', 'testnet'] as const,
  maxRetries: 3,
  timeoutMs: 30000
} as const;

const NETWORK_INFO: NetworkInfo = {
  network: 'trie',
  environment: 'development',
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: {
    faucet: true,
    competitions: true,
    mainnetFeatures: false
  }
} as const;


const getEnvironmentNetwork = (): string => {
  const envNetwork = import.meta.env.VITE_NETWORK;
  
  if (envNetwork && NETWORK_VALIDATION.supportedNetworks.includes(envNetwork as any)) {
    return envNetwork;
  }
  


  return NETWORK_CONFIG.TESTNET;
};


const CURRENT_NETWORK: string = getEnvironmentNetwork();
const IS_MAINNET: boolean = CURRENT_NETWORK === NETWORK_CONFIG.MAINNET;
const IS_TESTNET: boolean = CURRENT_NETWORK === NETWORK_CONFIG.TESTNET;


const TOKEN_NAME: string = IS_MAINNET ? 'tri' : 'trie';
const SHOW_REQUEST_TOKENS_BUTTON: boolean = IS_TESTNET;


const CONTRACT_ADDRESSES: ContractAddresses = {
  CONTRACT_TOKEN: IS_MAINNET 
    ? "QmUjmtaEFTLpfm5Q6pZ4byriGFvxibF1h5XHWYRvTwvcJ3" 
    : "QmT3KjFNpLSTeyrv3MmR7bnEfyi2GQep2Aqyar5frbefuR",
  
  BUY_TOKEN: IS_MAINNET 
    ? "QmNwpc6DwwQMuzHJiXrhmGzEwXyPK9PV5QqZrmDiDTb6TN" 
    : "QmbQUGRyK4BNrrDewd6eBx7pY8wpW2wCwjQoD5zz3i29Hj",
  
  RATING_TOKEN: IS_MAINNET 
    ? "Qme6BUxAVX2vLN71j5sooXNKnZQJ6Y24q4ZkbkD9XjQBJ4" 
    : "QmfEkQvWcLZEghJ1swffQg9nxcnT13j6xLiB3CqPXUvfg2",
  
  INFERENCE_CONTRACT: IS_MAINNET 
    ? "QmTycH8eLA9xp4Jckjit4LQkuRgeq3xaUZdKFsNtohrzFe" 
    : "QmS5DogBfk96voS54hhE4KemToGRWgGC6Fbk5cZboTNh3m",
  
  FT_DENOM_CREATOR: IS_MAINNET 
    ? "bafybmifzar4metqgkm4ivtnvabmiouyi32y2x2ikpi5h4tflrfug2ghi5q" 
    : "bafybmifzar4metqgkm4ivtnvabmiouyi32y2x2ikpi5h4tflrfug2ghi5q",
  
  FT_DENOM: IS_MAINNET ? "TRIE" : "TRIE",
  
  TOPUP_TOKEN: IS_MAINNET ? "" : "QmRQb5213qyG7xiZS2sF9WqPvpBjb34jpGFLSoTAeeqEcH"
} as const;


const API_ENDPOINTS: ApiEndpoints = {
  node: IS_MAINNET 
    ? "https://mainnet.xellwallet.com:8445/api/" 
    : "https://dev-api.xellwallet.com:444/api/",
  
  dapp: IS_MAINNET 
    ? "https://mainnet.xellwallet.com:8449/api/" 
    : "https://dev-api.xellwallet.com:8443/api/",
  
  faucet: IS_MAINNET ? "" : "https://trie-faucet-api.trie.network",
  
  metrics: IS_MAINNET 
    ? "https://mainnet.xellwallet.com:8449/" 
    : "https://dev-api.xellwallet.com:8443/",
  
  comp: IS_MAINNET ? "" : "https://dev-api.xellwallet.com:8448",
  
  websocket: IS_MAINNET 
    ? "wss://mainnet.xellwallet.com:8443/ws" 
    : "wss://dev-api.xellwallet.com:8443/ws",
  
  explorer: IS_MAINNET 
    ? "https://mainnet.rubixexplorer.com" 
    : "https://testnet.rubixexplorer.com"
} as const;


const NETWORK_CONSTANTS: NetworkConstants = {
  contracts: CONTRACT_ADDRESSES,
  api: API_ENDPOINTS,
  validation: NETWORK_VALIDATION
} as const;


const networkUtils: NetworkUtility = {

  getCurrentNetwork: (): string => CURRENT_NETWORK,


  isMainnet: (): boolean => IS_MAINNET,


  isTestnet: (): boolean => IS_TESTNET,


  getTokenName: (): string => TOKEN_NAME,


  shouldShowRequestTokens: (): boolean => SHOW_REQUEST_TOKENS_BUTTON,


  getContractAddress: (contractName: keyof ContractAddresses): string => {
    const address = CONTRACT_ADDRESSES[contractName];
    
    if (!address) {
     
      return '';
    }
    
    return address;
  },


  getApiEndpoint: (serviceName: keyof ApiEndpoints): string => {
    const endpoint = API_ENDPOINTS[serviceName];
    
    if (!endpoint) {
     
      return '';
    }
    
    return endpoint;
  },


  validateNetworkConfig: (): boolean => {

    if (!NETWORK_VALIDATION.supportedNetworks.includes(CURRENT_NETWORK as any)) {
      
      return false;
    }


    const missingEnvVars = NETWORK_VALIDATION.requiredEnvVars.filter(
      envVar => !import.meta.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      
    }


    const invalidContracts = Object.entries(CONTRACT_ADDRESSES)
      .filter(([name, address]) => !address && name !== 'TOPUP_TOKEN')
      .map(([name]) => name);

    if (invalidContracts.length > 0) {
      
    }

    return true;
  },


  getNetworkInfo: (): NetworkInfo => {
    return {
      ...NETWORK_INFO,
      network: CURRENT_NETWORK,
      environment: IS_MAINNET ? 'production' : 'development',
      features: {
        ...NETWORK_INFO.features,
        mainnetFeatures: IS_MAINNET,
        faucet: IS_TESTNET,
        competitions: IS_TESTNET
      }
    };
  },


  getNetworkState: (): NetworkState => {
    return {
      currentNetwork: CURRENT_NETWORK,
      isMainnet: IS_MAINNET,
      isTestnet: IS_TESTNET,
      tokenName: TOKEN_NAME,
      showRequestTokensButton: SHOW_REQUEST_TOKENS_BUTTON
    };
  },


  createCustomNetworkConfig: (customNetwork: string, customConfig: Partial<ContractAddresses & ApiEndpoints>) => {
    
    
    return {
      network: customNetwork,
      contracts: { ...CONTRACT_ADDRESSES, ...customConfig },
      api: { ...API_ENDPOINTS, ...customConfig }
    };
  }
} as const;


export const Network = NETWORK_CONFIG;
export { CURRENT_NETWORK, TOKEN_NAME, SHOW_REQUEST_TOKENS_BUTTON };
export const isMainnet = IS_MAINNET;
export const CONSTANTS = CONTRACT_ADDRESSES;
export const API_PORTS = API_ENDPOINTS;


export { 
  networkUtils, 
  NETWORK_CONSTANTS, 
  NETWORK_INFO,
  CONTRACT_ADDRESSES,
  API_ENDPOINTS
};


export type { 
  NetworkConfig, 
  NetworkState, 
  ContractAddresses, 
  ApiEndpoints, 
  NetworkConstants, 
  NetworkUtility, 
  NetworkInfo 
}; 