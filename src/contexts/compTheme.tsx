
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { getNetworkColor } from '../config/colors';


interface CompThemeContextType {
  readonly primaryColor: string;
  readonly compId: string;
  readonly themeName?: string;
  readonly themeVersion?: string;
  readonly isCustomTheme?: boolean;
  readonly themeMetadata?: ThemeMetadata;
}

interface ThemeMetadata {
  readonly createdAt: string;
  readonly lastModified: string;
  readonly author?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly features?: readonly string[];
}

interface CompThemeProviderProps {
  readonly primaryColor?: string;
  readonly compId: string;
  readonly children: ReactNode;
  readonly themeName?: string;
  readonly themeVersion?: string;
  readonly isCustomTheme?: boolean;
  readonly themeMetadata?: Partial<ThemeMetadata>;
}

interface CompThemeUtility {
  readonly getThemeInfo: () => CompThemeContextType;
  readonly isCustomTheme: () => boolean;
  readonly getThemeMetadata: () => ThemeMetadata | undefined;
  readonly validateTheme: (theme: Partial<CompThemeContextType>) => boolean;
  readonly createCustomTheme: (config: Partial<CompThemeContextType>) => CompThemeContextType;
  readonly getThemeFeatures: () => readonly string[];
  readonly getThemeTags: () => readonly string[];
}

interface CompThemeStats {
  readonly totalThemes: number;
  readonly customThemes: number;
  readonly defaultThemes: number;
  readonly lastUpdated: string;
}


const COMP_THEME_METADATA = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'dynamic-colors',
    'competition-specific',
    'custom-themes',
    'theme-validation',
    'performance-optimized'
  ] as const,
  supportedThemeTypes: [
    'default',
    'custom',
    'network-based',
    'competition-specific'
  ] as const
} as const;


const DEFAULT_THEME_CONFIG: CompThemeContextType = {
  primaryColor: getNetworkColor(),
  compId: 'default',
  themeName: 'Default Theme',
  themeVersion: '1.0.0',
  isCustomTheme: false,
  themeMetadata: {
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    author: 'System',
    description: 'Default competition theme',
    tags: ['default', 'system'],
    features: ['basic', 'network-colors']
  }
} as const;


const compThemeUtils: CompThemeUtility = {
  
  getThemeInfo: (): CompThemeContextType => {
    return DEFAULT_THEME_CONFIG;
  },

  
  isCustomTheme: (): boolean => {
    return DEFAULT_THEME_CONFIG.isCustomTheme || false;
  },


  getThemeMetadata: (): ThemeMetadata | undefined => {
    return DEFAULT_THEME_CONFIG.themeMetadata;
  },

  
  validateTheme: (theme: Partial<CompThemeContextType>): boolean => {
    if (!theme.primaryColor || typeof theme.primaryColor !== 'string') {
      return false;
    }

    if (!theme.compId || typeof theme.compId !== 'string') {
      return false;
    }

    
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(theme.primaryColor)) {
      return false;
    }

    return true;
  },

  
  createCustomTheme: (config: Partial<CompThemeContextType>): CompThemeContextType => {
    const now = new Date().toISOString();
    
    return {
      ...DEFAULT_THEME_CONFIG,
      ...config,
      isCustomTheme: true,
      themeMetadata: {
        ...DEFAULT_THEME_CONFIG.themeMetadata,
        ...config.themeMetadata,
        createdAt: config.themeMetadata?.createdAt || now,
        lastModified: now
      }
    };
  },

  
  getThemeFeatures: (): readonly string[] => {
    return COMP_THEME_METADATA.features;
  },

  
  getThemeTags: (): readonly string[] => {
    return DEFAULT_THEME_CONFIG.themeMetadata?.tags || [];
  }
} as const;


const COMP_THEME_STATS: CompThemeStats = {
  totalThemes: 1,
  customThemes: 0,
  defaultThemes: 1,
  lastUpdated: '2024-01-01'
} as const;


export const CompThemeContext = createContext<CompThemeContextType>(DEFAULT_THEME_CONFIG);


export const CompThemeProvider: React.FC<CompThemeProviderProps> = ({
  primaryColor = getNetworkColor(),
  compId = 'default',
  children,
  themeName = 'Default Theme',
  themeVersion = '1.0.0',
  isCustomTheme = false,
  themeMetadata
}) => {
  
  const themeContextValue = useMemo<CompThemeContextType>(() => {
    const now = new Date().toISOString();
    
    const themeConfig: CompThemeContextType = {
      primaryColor,
      compId,
      themeName,
      themeVersion,
      isCustomTheme,
      themeMetadata: {
        createdAt: themeMetadata?.createdAt || now,
        lastModified: now,
        author: themeMetadata?.author || 'System',
        description: themeMetadata?.description || 'Competition theme',
        tags: themeMetadata?.tags || ['competition'],
        features: themeMetadata?.features || ['dynamic', 'responsive']
      }
    };

    
    if (!compThemeUtils.validateTheme(themeConfig)) {
      
      return DEFAULT_THEME_CONFIG;
    }

    return themeConfig;
  }, [primaryColor, compId, themeName, themeVersion, isCustomTheme, themeMetadata]);

  return (
    <CompThemeContext.Provider value={themeContextValue}>
      {children}
    </CompThemeContext.Provider>
  );
};


export const useCompTheme = (): CompThemeContextType => {
  const context = useContext(CompThemeContext);
  
  if (!context) {
   
    return DEFAULT_THEME_CONFIG;
  }
  
  return context;
};


export { 
  compThemeUtils, 
  COMP_THEME_METADATA,
  COMP_THEME_STATS,
  DEFAULT_THEME_CONFIG
};


export type { 
  CompThemeContextType, 
  CompThemeProviderProps, 
  ThemeMetadata, 
  CompThemeUtility, 
  CompThemeStats 
};
