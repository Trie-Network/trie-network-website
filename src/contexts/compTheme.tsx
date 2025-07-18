import React, { createContext, useContext, ReactNode, useMemo } from 'react';

export interface CompThemeContextType {
  primaryColor: string;
  compId: string;
}

export interface CompThemeProviderProps {
  primaryColor?: string;
  compId: string;
  children: ReactNode;
}

const DEFAULT_THEME: CompThemeContextType = {
  primaryColor: '#0284a5',
  compId: 'default',
};

export const CompThemeContext = createContext<CompThemeContextType>(DEFAULT_THEME);

export const CompThemeProvider: React.FC<CompThemeProviderProps> = ({
  primaryColor = DEFAULT_THEME.primaryColor,
  compId = DEFAULT_THEME.compId,
  children
}) => {
  const themeValue = useMemo(() => ({
    primaryColor,
    compId
  }), [primaryColor, compId]);

  return (
    <CompThemeContext.Provider value={themeValue}>
      {children}
    </CompThemeContext.Provider>
  );
};

export const useCompTheme = (): CompThemeContextType => {
  const context = useContext(CompThemeContext);

  if (!context) {
    throw new Error('useCompTheme must be used within a CompThemeProvider');
  }

  return context;
};
