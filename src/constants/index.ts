
interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly author?: string;
  readonly license?: string;
  readonly api: {
    readonly baseUrl: string;
    readonly timeout: number;
    readonly retries?: number;
    readonly headers?: Record<string, string>;
  };
  readonly features?: {
    readonly darkMode: boolean;
    readonly notifications: boolean;
    readonly analytics: boolean;
    readonly experimental: boolean;
  };
  readonly limits?: {
    readonly maxFileSize: number;
    readonly maxUploads: number;
    readonly maxSearchResults: number;
  };
}

interface RouteConfig {
  readonly home: string;
  readonly dashboard: string;
  readonly models: string;
  readonly datasets: string;
  readonly providers: string;
  readonly tools: string;
  readonly auth?: {
    readonly login: string;
    readonly register: string;
    readonly forgotPassword: string;
  };
  readonly api?: {
    readonly base: string;
    readonly models: string;
    readonly datasets: string;
    readonly providers: string;
  };
}

interface ConstantsMetadata {
  readonly lastUpdated: string;
  readonly version: string;
  readonly environment: 'development' | 'production' | 'test';
  readonly features: readonly string[];
}

interface ConstantsUtility {
  readonly getAppConfig: () => AppConfig;
  readonly getRoutes: () => RouteConfig;
  readonly validateConfig: () => boolean;
  readonly getMetadata: () => ConstantsMetadata;
  readonly isFeatureEnabled: (feature: keyof AppConfig['features']) => boolean;
  readonly getApiConfig: () => AppConfig['api'];
  readonly getRoute: (routeName: keyof RouteConfig) => string;
  readonly createCustomConfig: (customConfig: Partial<AppConfig>) => AppConfig;
  readonly getEnvironmentConfig: () => Partial<AppConfig>;
  readonly getFeatureConfig: (feature: string) => any;
  readonly validateRoute: (path: string) => boolean;
  readonly getAllRoutes: () => Record<string, string>;
}

const APP_CONFIG_DATA: AppConfig = {
  name: 'TRIE AI Marketplace',
  version: '0.1.0',
  description: 'Decentralized AI marketplace powered by blockchain technology',
  author: 'Trie Network Team',
  license: 'MIT',
  api: {
    baseUrl: 'https://api.trie.network',
    timeout: 30000,
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  features: {
    darkMode: true,
    notifications: true,
    analytics: true,
    experimental: false
  },
  limits: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxUploads: 10,
    maxSearchResults: 100
  }
} as const;

const ROUTES_DATA: RouteConfig = {
  home: '/',
  dashboard: '/dashboard',
  models: '/dashboard/models',
  datasets: '/dashboard/datasets',
  providers: '/dashboard/providers',
  tools: '/dashboard/tools',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password'
  },
  api: {
    base: '/api',
    models: '/api/models',
    datasets: '/api/datasets',
    providers: '/api/providers'
  }
} as const;

const CONSTANTS_METADATA: ConstantsMetadata = {
  lastUpdated: '2024-01-01',
  version: '1.0.0',
  environment: 'development',
  features: [
    'type-safe-configuration',
    'route-management',
    'api-configuration',
    'feature-flags',
    'validation'
  ]
} as const;

const constantsUtils: ConstantsUtility = {
  getAppConfig: (): AppConfig => {
    return APP_CONFIG_DATA;
  },

  getRoutes: (): RouteConfig => {
    return ROUTES_DATA;
  },

  validateConfig: (): boolean => {
    if (!APP_CONFIG_DATA.name || !APP_CONFIG_DATA.version) {
     
      return false;
    }

    if (!APP_CONFIG_DATA.api.baseUrl || APP_CONFIG_DATA.api.timeout <= 0) {
      
      return false;
    }

    const requiredRoutes = ['home', 'dashboard', 'models', 'datasets', 'providers', 'tools'];
    const missingRoutes = requiredRoutes.filter(route => !ROUTES_DATA[route as keyof RouteConfig]);

    if (missingRoutes.length > 0) {
      
      return false;
    }

    return true;
  },

  getMetadata: (): ConstantsMetadata => {
    return CONSTANTS_METADATA;
  },

  isFeatureEnabled: (feature: keyof AppConfig['features']): boolean => {
    return APP_CONFIG_DATA.features?.[feature] || false;
  },

  getApiConfig: (): AppConfig['api'] => {
    return APP_CONFIG_DATA.api;
  },

  getRoute: (routeName: keyof RouteConfig): string => {
    const route = ROUTES_DATA[routeName];
    
    if (typeof route === 'string') {
      return route;
    }
    
    
    return '';
  },

  createCustomConfig: (customConfig: Partial<AppConfig>): AppConfig => {
    const mergedConfig: AppConfig = {
      ...APP_CONFIG_DATA,
      ...customConfig,
      api: {
        ...APP_CONFIG_DATA.api,
        ...customConfig.api
      },
      features: customConfig.features ? {
        darkMode: customConfig.features.darkMode ?? APP_CONFIG_DATA.features!.darkMode,
        notifications: customConfig.features.notifications ?? APP_CONFIG_DATA.features!.notifications,
        analytics: customConfig.features.analytics ?? APP_CONFIG_DATA.features!.analytics,
        experimental: customConfig.features.experimental ?? APP_CONFIG_DATA.features!.experimental
      } : APP_CONFIG_DATA.features,
      limits: customConfig.limits ? {
        maxFileSize: customConfig.limits.maxFileSize ?? APP_CONFIG_DATA.limits!.maxFileSize,
        maxUploads: customConfig.limits.maxUploads ?? APP_CONFIG_DATA.limits!.maxUploads,
        maxSearchResults: customConfig.limits.maxSearchResults ?? APP_CONFIG_DATA.limits!.maxSearchResults
      } : APP_CONFIG_DATA.limits
    };

    if (!constantsUtils.validateConfig()) {
      
    }

    return mergedConfig;
  },

  getEnvironmentConfig: (): Partial<AppConfig> => {
    const env = process.env.NODE_ENV || 'development';
    
    switch (env) {
      case 'production':
        return {
          features: {
            darkMode: APP_CONFIG_DATA.features!.darkMode,
            notifications: APP_CONFIG_DATA.features!.notifications,
            analytics: true,
            experimental: false
          },
          api: {
            ...APP_CONFIG_DATA.api,
            timeout: 60000
          }
        };
      
      case 'test':
        return {
          features: {
            darkMode: APP_CONFIG_DATA.features!.darkMode,
            notifications: false,
            analytics: false,
            experimental: APP_CONFIG_DATA.features!.experimental
          },
          api: {
            ...APP_CONFIG_DATA.api,
            baseUrl: 'http://localhost:3000',
            timeout: 5000
          }
        };
      
      default:
        return {};
    }
  },

  
  getFeatureConfig: (feature: string): any => {
    switch (feature) {
      case 'api':
        return APP_CONFIG_DATA.api;
      case 'features':
        return APP_CONFIG_DATA.features;
      case 'limits':
        return APP_CONFIG_DATA.limits;
      case 'routes':
        return ROUTES_DATA;
      default:
        
        return null;
    }
  },

 
  validateRoute: (path: string): boolean => {
    if (!path || typeof path !== 'string') {
      return false;
    }

    if (!path.startsWith('/')) {
      return false;
    }

    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(path)) {
      return false;
    }

    return true;
  },

  
  getAllRoutes: (): Record<string, string> => {
    const routes: Record<string, string> = {};
    
    Object.entries(ROUTES_DATA).forEach(([key, value]) => {
      if (typeof value === 'string') {
        routes[key] = value;
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          if (typeof nestedValue === 'string') {
            routes[`${key}.${nestedKey}`] = nestedValue;
          }
        });
      }
    });
    
    return routes;
  }
} as const;

export const APP_CONFIG = APP_CONFIG_DATA;
export const ROUTES = ROUTES_DATA;

export { 
  constantsUtils, 
  CONSTANTS_METADATA,
  APP_CONFIG_DATA,
  ROUTES_DATA
};

// Re-export storage configuration for convenience
export { STORAGE_KEYS, storageUtils } from './storage';

export type { 
  AppConfig, 
  RouteConfig, 
  ConstantsMetadata, 
  ConstantsUtility 
};