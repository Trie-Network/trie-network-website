

import React, { useEffect, useMemo, useCallback } from 'react';
import { NETWORK_COLORS } from '../config/colors';


interface ThemeProviderProps {
  readonly children: React.ReactNode;
  readonly enableDebugging?: boolean;
  readonly onThemeChange?: (theme: ThemeInfo) => void;
  readonly customColors?: Partial<CustomColors>;
}

interface ThemeInfo {
  readonly primaryColor: string;
  readonly primaryHoverColor: string;
  readonly primaryLightColor: string;
  readonly primaryRgb: string;
  readonly timestamp: string;
}

interface CustomColors {
  readonly primary?: string;
  readonly primaryHover?: string;
  readonly primaryRgb?: string;
}

interface ThemeProviderMetadata {
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: readonly string[];
  readonly dependencies: readonly string[];
}

interface ThemeProviderUtility {
  readonly getMetadata: () => ThemeProviderMetadata;
  readonly validateProps: (props: Partial<ThemeProviderProps>) => boolean;
  readonly createDebugInfo: (props: ThemeProviderProps) => DebugInfo;
  readonly getStats: () => ThemeProviderStats;
  readonly applyThemeToDOM: (themeInfo: ThemeInfo) => void;
  readonly createThemeInfo: (colors: typeof NETWORK_COLORS) => ThemeInfo;
}

interface DebugInfo {
  readonly providerName: string;
  readonly enableDebugging: boolean;
  readonly customColors: boolean;
  readonly timestamp: string;
}

interface ThemeProviderStats {
  totalRenders: number;
  successfulThemeApplications: number;
  lastUpdated: string;
}


const THEME_PROVIDER_METADATA: ThemeProviderMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'type-safe-theme-management',
    'css-custom-properties',
    'network-aware-theming',
    'performance-optimized',
    'debugging-support',
    'theme-statistics'
  ],
  dependencies: ['react', 'useEffect', 'useMemo', 'useCallback', 'NETWORK_COLORS']
} as const;


let themeProviderStats: ThemeProviderStats = {
  totalRenders: 0,
  successfulThemeApplications: 0,
  lastUpdated: new Date().toISOString()
};


const themeProviderUtils: ThemeProviderUtility = {

  getMetadata: (): ThemeProviderMetadata => {
    return THEME_PROVIDER_METADATA;
  },


  validateProps: (props: Partial<ThemeProviderProps>): boolean => {
    if (props.enableDebugging !== undefined && typeof props.enableDebugging !== 'boolean') {
      return false;
    }

    if (props.customColors !== undefined && typeof props.customColors !== 'object') {
      return false;
    }

    return true;
  },


  createDebugInfo: (props: ThemeProviderProps): DebugInfo => {
    return {
      providerName: 'ThemeProvider',
      enableDebugging: props.enableDebugging ?? false,
      customColors: !!props.customColors,
      timestamp: new Date().toISOString()
    };
  },


  getStats: (): ThemeProviderStats => {
    return { ...themeProviderStats };
  },


  applyThemeToDOM: (themeInfo: ThemeInfo): void => {
    const root = document.documentElement;
    
    try {
      root.style.setProperty('--primary-color', themeInfo.primaryColor);
      root.style.setProperty('--primary-hover-color', themeInfo.primaryHoverColor);
      root.style.setProperty('--primary-light-color', themeInfo.primaryLightColor);
      
      themeProviderStats.successfulThemeApplications++;
      themeProviderStats.lastUpdated = new Date().toISOString();
    } catch (error) {
      
    }
  },


  createThemeInfo: (colors: typeof NETWORK_COLORS): ThemeInfo => {
    return {
      primaryColor: colors.primary,
      primaryHoverColor: colors.primaryHover,
      primaryLightColor: `rgba(${colors.primaryRgb}, 0.1)`,
      primaryRgb: colors.primaryRgb,
      timestamp: new Date().toISOString()
    };
  }
} as const;



export function ThemeProvider(props: ThemeProviderProps): React.ReactElement {
  const {
    children,
    enableDebugging = false,
    onThemeChange,
    customColors
  } = props;


  themeProviderStats.totalRenders++;
  themeProviderStats.lastUpdated = new Date().toISOString();

 
  if (!themeProviderUtils.validateProps(props)) {
    
  }

 
  const debugInfo = useMemo(() => {
    if (!enableDebugging) return null;
    return themeProviderUtils.createDebugInfo(props);
  }, [enableDebugging, props]);

  const themeInfo = useMemo(() => {
    const colors = {
      ...NETWORK_COLORS,
      ...customColors
    };
    return themeProviderUtils.createThemeInfo(colors);
  }, [customColors]);

 
  const applyTheme = useCallback(() => {
    themeProviderUtils.applyThemeToDOM(themeInfo);
    
   
    onThemeChange?.(themeInfo);
    
   
    if (enableDebugging && debugInfo) {
   
    }
  }, [themeInfo, onThemeChange, enableDebugging, debugInfo]);

 
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return <>{children}</>;
}


export function ThemeProviderSimple({ children }: { children: React.ReactNode }): React.ReactElement {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', NETWORK_COLORS.primary);
    root.style.setProperty('--primary-hover-color', NETWORK_COLORS.primaryHover);
    root.style.setProperty('--primary-light-color', `rgba(${NETWORK_COLORS.primaryRgb}, 0.1)`);
  }, []);

  return <>{children}</>;
}


export { 
  themeProviderUtils, 
  THEME_PROVIDER_METADATA
};


export type { 
  ThemeProviderProps, 
  ThemeProviderMetadata, 
  ThemeProviderUtility, 
  DebugInfo, 
  ThemeProviderStats,
  ThemeInfo,
  CustomColors
};