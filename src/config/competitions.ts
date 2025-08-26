

import { getNetworkColor } from './colors';


interface CompetitionTheme {
  id: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  name?: string;
  description?: string;
  dates?: string;
  location?: string;
}

interface CompetitionThemeConfig {
  defaultTheme: string;
  fallbackTheme: CompetitionTheme;
  validationRules: {
    requiredFields: readonly string[];
    maxNameLength: number;
    maxDescriptionLength: number;
  };
}

interface CompetitionThemeUtility {
  getTheme: (compId: string) => CompetitionTheme;
  hasTheme: (compId: string) => boolean;
  getAllThemeIds: () => string[];
  validateTheme: (theme: CompetitionTheme) => boolean;
  getThemeMetadata: () => CompetitionThemeMetadata;
}

interface CompetitionThemeMetadata {
  totalThemes: number;
  availableCompetitions: string[];
  lastUpdated: string;
  version: string;
}


const DEFAULT_THEME: CompetitionTheme = {
  id: 'default',
  primaryColor: getNetworkColor(),
  secondaryColor: '#e6f7fc',
  accentColor: '#004e66',
  textColor: '#333333',
  name: 'Default Competition'
} as const;

const DALLAS_AI_THEME: CompetitionTheme = {
  id: 'dallas-ai',
  primaryColor: '#ff6b00',
  secondaryColor: '#fff0e6',
  accentColor: '#cc5500',
  textColor: '#333333',
  name: 'Dallas AI Summer Program 2025',
  description: 'The world\'s first AI Summer Camp where models, data and infra are all hosted on blockchain network',
  dates: 'June 7 - August 9, 2025',
  location: 'Dallas, TX (In-person + Zoom)'
} as const;



const COMPETITION_THEME_CONFIG: CompetitionThemeConfig = {
  defaultTheme: 'default',
  fallbackTheme: DEFAULT_THEME,
  validationRules: {
    requiredFields: ['id', 'primaryColor'] as const,
    maxNameLength: 100,
    maxDescriptionLength: 500
  }
} as const;

const COMPETITION_THEME_METADATA: CompetitionThemeMetadata = {
  totalThemes: 2,
  availableCompetitions: ['default', 'dallas-ai'],
  lastUpdated: '2024-01-01',
  version: '1.0.0'
} as const;


const COMPETITION_THEMES: Record<string, CompetitionTheme> = {
  'default': DEFAULT_THEME,
  'dallas-ai': DALLAS_AI_THEME
} as const;


const competitionThemeUtils = {

  getTheme: (compId: string): CompetitionTheme => {
    return COMPETITION_THEMES[compId] || COMPETITION_THEMES[COMPETITION_THEME_CONFIG.defaultTheme];
  },


  hasTheme: (compId: string): boolean => {
    return compId in COMPETITION_THEMES;
  },


  getAllThemeIds: (): string[] => {
    return Object.keys(COMPETITION_THEMES);
  },


  validateTheme: (theme: CompetitionTheme): boolean => {

    const hasRequiredFields = COMPETITION_THEME_CONFIG.validationRules.requiredFields.every(
      field => theme[field as keyof CompetitionTheme] !== undefined
    );

    if (!hasRequiredFields) {
      return false;
    }


    if (theme.name && theme.name.length > COMPETITION_THEME_CONFIG.validationRules.maxNameLength) {
      return false;
    }

    if (theme.description && theme.description.length > COMPETITION_THEME_CONFIG.validationRules.maxDescriptionLength) {
      return false;
    }


    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(theme.primaryColor)) {
      return false;
    }

    return true;
  },


  getThemeMetadata: (): CompetitionThemeMetadata => {
    return {
      ...COMPETITION_THEME_METADATA,
      totalThemes: Object.keys(COMPETITION_THEMES).length,
      availableCompetitions: Object.keys(COMPETITION_THEMES)
    };
  },


  getValidatedTheme: (compId: string): CompetitionTheme => {
    const theme = competitionThemeUtils.getTheme(compId);
    
    if (!competitionThemeUtils.validateTheme(theme)) {
    
      return COMPETITION_THEME_CONFIG.fallbackTheme;
    }
    
    return theme;
  },


  getThemeColors: (compId: string): Pick<CompetitionTheme, 'primaryColor' | 'secondaryColor' | 'accentColor' | 'textColor'> => {
    const theme = competitionThemeUtils.getTheme(compId);
    return {
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      textColor: theme.textColor
    };
  },

  
  getThemeInfo: (compId: string): Pick<CompetitionTheme, 'name' | 'description' | 'dates' | 'location'> => {
    const theme = competitionThemeUtils.getTheme(compId);
    return {
      name: theme.name,
      description: theme.description,
      dates: theme.dates,
      location: theme.location
    };
  },

  
  createCustomTheme: (theme: Partial<CompetitionTheme>): CompetitionTheme => {
    const customTheme: CompetitionTheme = {
      id: theme.id || 'custom',
      primaryColor: theme.primaryColor || COMPETITION_THEME_CONFIG.fallbackTheme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      textColor: theme.textColor || COMPETITION_THEME_CONFIG.fallbackTheme.textColor,
      name: theme.name,
      description: theme.description,
      dates: theme.dates,
      location: theme.location
    };

    if (!competitionThemeUtils.validateTheme(customTheme)) {
      throw new Error('Invalid custom theme configuration');
    }

    return customTheme;
  }
} as const;


export function getCompetitionTheme(compId: string): CompetitionTheme {
  return competitionThemeUtils.getTheme(compId);
}


export { COMPETITION_THEMES };


export { 
  competitionThemeUtils, 
  COMPETITION_THEME_CONFIG, 
  COMPETITION_THEME_METADATA,
  DEFAULT_THEME,
  DALLAS_AI_THEME
};


export type { 
  CompetitionTheme, 
  CompetitionThemeConfig, 
  CompetitionThemeUtility, 
  CompetitionThemeMetadata 
};
