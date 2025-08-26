
interface StyleConfig {
  readonly background: string;
  readonly text: string;
  readonly border?: string;
  readonly hover?: string;
  readonly focus?: string;
  readonly disabled?: string;
}

interface CategoryStyle {
  readonly name: string;
  readonly styles: StyleConfig;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly priority?: number;
}

interface StatusStyle {
  readonly name: string;
  readonly styles: StyleConfig;
  readonly description?: string;
  readonly icon?: string;
  readonly severity?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

interface StyleMetadata {
  readonly totalCategories: number;
  readonly totalStatuses: number;
  readonly colorPalette: readonly string[];
  readonly lastUpdated: string;
  readonly version: string;
}

interface StyleUtility {
  readonly getCategoryStyle: (categoryName: string) => StyleConfig | undefined;
  readonly getStatusStyle: (statusName: string) => StyleConfig | undefined;
  readonly getAllCategoryStyles: () => Record<string, CategoryStyle>;
  readonly getAllStatusStyles: () => Record<string, StatusStyle>;
  readonly validateStyle: (style: StyleConfig) => boolean;
  readonly getStyleMetadata: () => StyleMetadata;
  readonly createCustomStyle: (name: string, styles: StyleConfig, options?: Partial<CategoryStyle>) => CategoryStyle;
  readonly getStyleByColor: (color: string) => readonly string[];
  readonly mergeStyles: (baseStyle: StyleConfig, overrideStyle: Partial<StyleConfig>) => StyleConfig;
  readonly getStylesBySeverity: (severity: StatusStyle['severity']) => readonly string[];
  readonly getCategoryStylesByPriority: () => readonly CategoryStyle[];
  readonly getStylesWithFeature: (feature: 'icon' | 'color' | 'description') => readonly string[];
  readonly validateAllStyles: () => { valid: boolean; errors: string[] };
}


const COLOR_PALETTE = {
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
} as const;


const CATEGORY_STYLES_CONFIG: Record<string, CategoryStyle> = {
  'Natural Language Processing': {
    name: 'Natural Language Processing',
    styles: {
      background: COLOR_PALETTE.green.bg,
      text: COLOR_PALETTE.green.text,
      border: COLOR_PALETTE.green.border,
      hover: 'hover:bg-green-100',
      focus: 'focus:ring-green-500'
    },
    description: 'Models for text processing and language understanding',
    icon: '💬',
    color: '#10b981',
    priority: 1
  },
  'Multimodal': {
    name: 'Multimodal',
    styles: {
      background: COLOR_PALETTE.purple.bg,
      text: COLOR_PALETTE.purple.text,
      border: COLOR_PALETTE.purple.border,
      hover: 'hover:bg-purple-100',
      focus: 'focus:ring-purple-500'
    },
    description: 'Models that can process multiple types of data',
    icon: '🔄',
    color: '#8b5cf6',
    priority: 2
  },
  'Computer Vision': {
    name: 'Computer Vision',
    styles: {
      background: COLOR_PALETTE.blue.bg,
      text: COLOR_PALETTE.blue.text,
      border: COLOR_PALETTE.blue.border,
      hover: 'hover:bg-blue-100',
      focus: 'focus:ring-blue-500'
    },
    description: 'Models for image and video processing',
    icon: '👁️',
    color: '#3b82f6',
    priority: 3
  },
  'Audio': {
    name: 'Audio',
    styles: {
      background: COLOR_PALETTE.orange.bg,
      text: COLOR_PALETTE.orange.text,
      border: COLOR_PALETTE.orange.border,
      hover: 'hover:bg-orange-100',
      focus: 'focus:ring-orange-500'
    },
    description: 'Models for audio processing and generation',
    icon: '🎵',
    color: '#f97316',
    priority: 4
  },
  'Tabular': {
    name: 'Tabular',
    styles: {
      background: COLOR_PALETTE.indigo.bg,
      text: COLOR_PALETTE.indigo.text,
      border: COLOR_PALETTE.indigo.border,
      hover: 'hover:bg-indigo-100',
      focus: 'focus:ring-indigo-500'
    },
    description: 'Models for structured data analysis',
    icon: '📊',
    color: '#6366f1',
    priority: 5
  },
  'Reinforcement Learning': {
    name: 'Reinforcement Learning',
    styles: {
      background: COLOR_PALETTE.yellow.bg,
      text: COLOR_PALETTE.yellow.text,
      border: COLOR_PALETTE.yellow.border,
      hover: 'hover:bg-yellow-100',
      focus: 'focus:ring-yellow-500'
    },
    description: 'Models that learn through interaction',
    icon: '🤖',
    color: '#eab308',
    priority: 6
  },
  'Text Generation': {
    name: 'Text Generation',
    styles: {
      background: COLOR_PALETTE.emerald.bg,
      text: COLOR_PALETTE.emerald.text,
      border: COLOR_PALETTE.emerald.border,
      hover: 'hover:bg-emerald-100',
      focus: 'focus:ring-emerald-500'
    },
    description: 'Models for generating text content',
    icon: '✍️',
    color: '#059669',
    priority: 7
  },
  'Image Generation': {
    name: 'Image Generation',
    styles: {
      background: COLOR_PALETTE.rose.bg,
      text: COLOR_PALETTE.rose.text,
      border: COLOR_PALETTE.rose.border,
      hover: 'hover:bg-rose-100',
      focus: 'focus:ring-rose-500'
    },
    description: 'Models for generating images',
    icon: '🎨',
    color: '#e11d48',
    priority: 8
  },
  'Video Generation': {
    name: 'Video Generation',
    styles: {
      background: COLOR_PALETTE.cyan.bg,
      text: COLOR_PALETTE.cyan.text,
      border: COLOR_PALETTE.cyan.border,
      hover: 'hover:bg-cyan-100',
      focus: 'focus:ring-cyan-500'
    },
    description: 'Models for generating videos',
    icon: '🎬',
    color: '#0891b2',
    priority: 9
  },
  'Chat Models': {
    name: 'Chat Models',
    styles: {
      background: COLOR_PALETTE.fuchsia.bg,
      text: COLOR_PALETTE.fuchsia.text,
      border: COLOR_PALETTE.fuchsia.border,
      hover: 'hover:bg-fuchsia-100',
      focus: 'focus:ring-fuchsia-500'
    },
    description: 'Models optimized for conversational AI',
    icon: '💭',
    color: '#c026d3',
    priority: 10
  },
  'Vision Models': {
    name: 'Vision Models',
    styles: {
      background: COLOR_PALETTE.sky.bg,
      text: COLOR_PALETTE.sky.text,
      border: COLOR_PALETTE.sky.border,
      hover: 'hover:bg-sky-100',
      focus: 'focus:ring-sky-500'
    },
    description: 'Models for visual understanding',
    icon: '🔍',
    color: '#0ea5e9',
    priority: 11
  },
  'Other': {
    name: 'Other',
    styles: {
      background: COLOR_PALETTE.gray.bg,
      text: COLOR_PALETTE.gray.text,
      border: COLOR_PALETTE.gray.border,
      hover: 'hover:bg-gray-100',
      focus: 'focus:ring-gray-500'
    },
    description: 'Specialized models for unique use cases',
    icon: '🔗',
    color: '#6b7280',
    priority: 12
  }
} as const;

const STATUS_STYLES_CONFIG: Record<string, StatusStyle> = {
  completed: {
    name: 'completed',
    styles: {
      background: COLOR_PALETTE.green.bg,
      text: COLOR_PALETTE.green.text,
      border: COLOR_PALETTE.green.border,
      hover: 'hover:bg-green-100',
      focus: 'focus:ring-green-500'
    },
    description: 'Task or process has been successfully completed',
    icon: '✅',
    severity: 'success'
  },
  pending: {
    name: 'pending',
    styles: {
      background: COLOR_PALETTE.yellow.bg,
      text: COLOR_PALETTE.yellow.text,
      border: COLOR_PALETTE.yellow.border,
      hover: 'hover:bg-yellow-100',
      focus: 'focus:ring-yellow-500'
    },
    description: 'Task or process is waiting to be started',
    icon: '⏳',
    severity: 'warning'
  },
  processing: {
    name: 'processing',
    styles: {
      background: COLOR_PALETTE.blue.bg,
      text: COLOR_PALETTE.blue.text,
      border: COLOR_PALETTE.blue.border,
      hover: 'hover:bg-blue-100',
      focus: 'focus:ring-blue-500'
    },
    description: 'Task or process is currently being executed',
    icon: '🔄',
    severity: 'info'
  }
} as const;


const STYLE_METADATA: StyleMetadata = {
  totalCategories: Object.keys(CATEGORY_STYLES_CONFIG).length,
  totalStatuses: Object.keys(STATUS_STYLES_CONFIG).length,
  colorPalette: Object.values(COLOR_PALETTE).map(color => color.text.replace('text-', '')),
  lastUpdated: '2024-01-01',
  version: '1.0.0'
} as const;


const styleUtils: StyleUtility = {

  getCategoryStyle: (categoryName: string): StyleConfig | undefined => {
    const category = CATEGORY_STYLES_CONFIG[categoryName];
    return category?.styles;
  },


  getStatusStyle: (statusName: string): StyleConfig | undefined => {
    const status = STATUS_STYLES_CONFIG[statusName];
    return status?.styles;
  },


  getAllCategoryStyles: (): Record<string, CategoryStyle> => {
    return CATEGORY_STYLES_CONFIG;
  },


  getAllStatusStyles: (): Record<string, StatusStyle> => {
    return STATUS_STYLES_CONFIG;
  },


  validateStyle: (style: StyleConfig): boolean => {

    if (!style.background || !style.text) {
      return false;
    }


    if (!style.background.startsWith('bg-')) {
      return false;
    }


    if (!style.text.startsWith('text-')) {
      return false;
    }

    return true;
  },


  getStyleMetadata: (): StyleMetadata => {
    return STYLE_METADATA;
  },


  createCustomStyle: (name: string, styles: StyleConfig, options?: Partial<CategoryStyle>): CategoryStyle => {
    const customStyle: CategoryStyle = {
      name,
      styles,
      description: options?.description,
      icon: options?.icon,
      color: options?.color,
      priority: options?.priority || 999
    };


    if (!styleUtils.validateStyle(styles)) {
     
    }

    return customStyle;
  },


  getStyleByColor: (color: string): readonly string[] => {
    const colorKey = color.toLowerCase();
    const matchingCategories: string[] = [];

    Object.entries(CATEGORY_STYLES_CONFIG).forEach(([name, category]) => {
      if (category.color?.includes(colorKey) || category.styles.text.includes(colorKey)) {
        matchingCategories.push(name);
      }
    });

    return matchingCategories;
  },

  
  mergeStyles: (baseStyle: StyleConfig, overrideStyle: Partial<StyleConfig>): StyleConfig => {
    return {
      ...baseStyle,
      ...overrideStyle
    };
  },

  
  getStylesBySeverity: (severity: StatusStyle['severity']): readonly string[] => {
    return Object.entries(STATUS_STYLES_CONFIG)
      .filter(([_, status]) => status.severity === severity)
      .map(([name]) => name);
  },

  
  getCategoryStylesByPriority: (): readonly CategoryStyle[] => {
    return Object.values(CATEGORY_STYLES_CONFIG)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  },

  
  getStylesWithFeature: (feature: 'icon' | 'color' | 'description'): readonly string[] => {
    const categories = Object.entries(CATEGORY_STYLES_CONFIG)
      .filter(([_, category]) => category[feature])
      .map(([name]) => name);

    const statuses = Object.entries(STATUS_STYLES_CONFIG)
      .filter(([_, status]) => status[feature])
      .map(([name]) => name);

    return [...categories, ...statuses];
  },

  
  validateAllStyles: (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    
    Object.entries(CATEGORY_STYLES_CONFIG).forEach(([name, category]) => {
      if (!styleUtils.validateStyle(category.styles)) {
        errors.push(`Invalid category style: ${name}`);
      }
    });

    
    Object.entries(STATUS_STYLES_CONFIG).forEach(([name, status]) => {
      if (!styleUtils.validateStyle(status.styles)) {
        errors.push(`Invalid status style: ${name}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
} as const;


export const CATEGORY_STYLES = Object.fromEntries(
  Object.entries(CATEGORY_STYLES_CONFIG).map(([name, category]) => [
    name, 
    `${category.styles.background} ${category.styles.text}`
  ])
);

export const STATUS_STYLES = Object.fromEntries(
  Object.entries(STATUS_STYLES_CONFIG).map(([name, status]) => [
    name, 
    `${status.styles.background} ${status.styles.text}`
  ])
);


export { 
  styleUtils, 
  STYLE_METADATA,
  CATEGORY_STYLES_CONFIG,
  STATUS_STYLES_CONFIG,
  COLOR_PALETTE
};


export type { 
  StyleConfig, 
  CategoryStyle, 
  StatusStyle, 
  StyleMetadata, 
  StyleUtility 
};