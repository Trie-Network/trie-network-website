
export * from './auth';
export * from './LoaderContext';
export * from './compTheme';


export const CONTEXT_METADATA = {
  totalContexts: 3,
  availableContexts: ['auth', 'LoaderContext', 'compTheme'] as const,
  lastUpdated: '2024-01-01',
  version: '1.0.0',
  features: [
    'authentication',
    'loading-states',
    'theme-management',
    'type-safety',
    'performance-optimization'
  ] as const
} as const;


export const contextUtils = {
  
  getAvailableContexts: (): readonly string[] => {
    return CONTEXT_METADATA.availableContexts;
  },

  
  getContextMetadata: () => {
    return CONTEXT_METADATA;
  },

  
  isValidContext: (contextName: string): boolean => {
    return CONTEXT_METADATA.availableContexts.includes(contextName as any);
  },

  
  getContextInfo: (contextName: string) => {
    if (!contextUtils.isValidContext(contextName)) {
      return null;
    }

    const contextInfo = {
      auth: {
        name: 'auth',
        description: 'Authentication context for user management',
        features: ['user-auth', 'wallet-connection', 'session-management'],
        dependencies: ['react', 'wallet-service'],
        category: 'authentication'
      },
      LoaderContext: {
        name: 'LoaderContext',
        description: 'Loading state management context',
        features: ['loading-states', 'global-loaders', 'progress-tracking'],
        dependencies: ['react'],
        category: 'ui'
      },
      compTheme: {
        name: 'compTheme',
        description: 'Competition theme management context',
        features: ['theme-management', 'dynamic-colors', 'custom-themes'],
        dependencies: ['react', 'color-config'],
        category: 'styling'
      }
    };

    return contextInfo[contextName as keyof typeof contextInfo] || null;
  },

  
  getContextsByCategory: (category: string): readonly string[] => {
    const contexts = contextUtils.getAvailableContexts();
    const categorizedContexts: Record<string, readonly string[]> = {
      authentication: ['auth'],
      ui: ['LoaderContext'],
      styling: ['compTheme']
    };

    return categorizedContexts[category] || [];
  },

  
  getContextStats: () => {
    return {
      totalContexts: CONTEXT_METADATA.totalContexts,
      categories: ['authentication', 'ui', 'styling'],
      features: CONTEXT_METADATA.features,
      lastUpdated: CONTEXT_METADATA.lastUpdated
    };
  },

  
  validateContextConfig: (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    const contexts = contextUtils.getAvailableContexts();
    contexts.forEach(contextName => {
      try {
        if (!contextName) {
          errors.push(`Invalid context name: ${contextName}`);
        }
      } catch (error) {
        errors.push(`Failed to validate context: ${contextName}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  
  getContextDependencies: (contextName: string): readonly string[] => {
    const contextInfo = contextUtils.getContextInfo(contextName);
    return contextInfo?.dependencies || [];
  },


  getContextFeatures: (contextName: string): readonly string[] => {
    const contextInfo = contextUtils.getContextInfo(contextName);
    return contextInfo?.features || [];
  },

  
  createCustomContextConfig: (name: string, config: any) => {
   
    
    return {
      name,
      ...config,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
  },

  
  getContextExports: (contextName: string) => {
    const exports = {
      auth: {
        contexts: ['AuthContext'],
        providers: ['AuthProvider'],
        hooks: ['useAuth'],
        types: ['AuthContextValue', 'AuthProviderProps']
      },
      LoaderContext: {
        contexts: ['LoaderContext'],
        providers: ['LoaderProvider'],
        hooks: ['useLoader'],
        types: ['LoaderContextType', 'LoaderProviderProps']
      },
      compTheme: {
        contexts: ['CompThemeContext'],
        providers: ['CompThemeProvider'],
        hooks: ['useCompTheme'],
        types: ['CompThemeContextType', 'CompThemeProviderProps']
      }
    };

    return exports[contextName as keyof typeof exports] || null;
  },

  
  validateContextExports: (): { valid: boolean; missing: string[] } => {
    const missing: string[] = [];
    const requiredExports = [
      'AuthContext',
      'CompThemeContext',
      'LoaderContext'
    ];

    requiredExports.forEach(exportName => {
      try {
        if (!exportName) {
          missing.push(exportName);
        }
      } catch (error) {
        missing.push(exportName);
      }
    });

    return {
      valid: missing.length === 0,
      missing
    };
  }
} as const;


export interface ContextMetadata {
  readonly totalContexts: number;
  readonly availableContexts: readonly string[];
  readonly lastUpdated: string;
  readonly version: string;
  readonly features: readonly string[];
}

export interface ContextInfo {
  readonly name: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly dependencies: readonly string[];
  readonly category: string;
}

export interface ContextStats {
  readonly totalContexts: number;
  readonly categories: readonly string[];
  readonly features: readonly string[];
  readonly lastUpdated: string;
}

export interface ContextUtility {
  readonly getAvailableContexts: () => readonly string[];
  readonly getContextMetadata: () => ContextMetadata;
  readonly isValidContext: (contextName: string) => boolean;
  readonly getContextInfo: (contextName: string) => ContextInfo | null;
  readonly getContextsByCategory: (category: string) => readonly string[];
  readonly getContextStats: () => ContextStats;
  readonly validateContextConfig: () => { valid: boolean; errors: string[] };
  readonly getContextDependencies: (contextName: string) => readonly string[];
  readonly getContextFeatures: (contextName: string) => readonly string[];
  readonly createCustomContextConfig: (name: string, config: any) => any;
  readonly getContextExports: (contextName: string) => any;
  readonly validateContextExports: () => { valid: boolean; missing: string[] };
}


export default {
  contextUtils,
  CONTEXT_METADATA
};