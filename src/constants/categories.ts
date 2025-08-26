
interface CategoryType {
  readonly MODEL: 'model';
  readonly DATASET: 'dataset';
  readonly INFRA: 'infra';
}

interface CategoryLabel {
  readonly model: 'AI Model';
  readonly dataset: 'Dataset';
  readonly infra: 'Infrastructure';
}

interface ModelCategory {
  readonly name: string;
  readonly subcategories: readonly string[];
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly popularity?: number;
}

interface ModelCategories {
  readonly [key: string]: ModelCategory;
}

interface CategoryMetadata {
  readonly totalCategories: number;
  readonly totalSubcategories: number;
  readonly categoryTypes: readonly string[];
  readonly lastUpdated: string;
  readonly version: string;
}

interface CategoryUtility {
  readonly getCategoryType: (type: keyof CategoryType) => string;
  readonly getCategoryLabel: (type: keyof CategoryLabel) => string;
  readonly getAllModelCategories: () => ModelCategories;
  readonly getModelCategory: (categoryName: string) => ModelCategory | undefined;
  readonly getSubcategories: (categoryName: string) => readonly string[];
  readonly getAllSubcategories: () => readonly string[];
  readonly searchCategories: (query: string) => readonly string[];
  readonly validateCategory: (categoryName: string, subcategoryName?: string) => boolean;
  readonly getCategoryMetadata: () => CategoryMetadata;
  readonly getCategoryStats: () => CategoryStats;
  readonly getPopularCategories: (threshold?: number) => readonly string[];
  readonly getCategoriesByFeature: (feature: 'icon' | 'color' | 'description') => readonly string[];
  readonly createCustomCategory: (name: string, subcategories: string[], options?: Partial<ModelCategory>) => ModelCategory;
}

interface CategoryStats {
  readonly totalCategories: number;
  readonly totalSubcategories: number;
  readonly categoriesByType: Record<string, number>;
  readonly mostPopularCategories: readonly string[];
  readonly recentlyAdded: readonly string[];
}

const CATEGORY_TYPES: CategoryType = {
  MODEL: 'model',
  DATASET: 'dataset',
  INFRA: 'infra'
} as const;


const CATEGORY_LABELS: CategoryLabel = {
  model: 'AI Model',
  dataset: 'Dataset',
  infra: 'Infrastructure'
} as const;

const MODEL_CATEGORIES_CONFIG: ModelCategories = {
  'Multimodal': {
    name: 'Multimodal',
    subcategories: [
      'Audio-Text-to-Text',
      'Image-Text-to-Text', 
      'Visual Question Answering',
      'Document Question Answering',
      'Video-Text-to-Text',
      'Visual Document Retrieval',
      'Any-to-Any'
    ],
    description: 'Models that can process and generate multiple types of data',
    icon: '🔄',
    color: '#6366f1',
    popularity: 95
  },
  'Computer Vision': {
    name: 'Computer Vision',
    subcategories: [
      'Depth Estimation',
      'Image Classification',
      'Object Detection',
      'Image Segmentation',
      'Text-to-Image',
      'Image-to-Text',
      'Image-to-Image',
      'Image-to-Video',
      'Unconditional Image Generation',
      'Video Classification',
      'Text-to-Video',
      'Zero-Shot Image Classification',
      'Mask Generation',
      'Zero-Shot Object Detection',
      'Text-to-3D',
      'Image-to-3D',
      'Image Feature Extraction',
      'Keypoint Detection'
    ],
    description: 'Models for processing and analyzing visual information',
    icon: '👁️',
    color: '#10b981',
    popularity: 98
  },
  'Natural Language Processing': {
    name: 'Natural Language Processing',
    subcategories: [
      'Text Classification',
      'Token Classification',
      'Table Question Answering',
      'Question Answering',
      'Zero-Shot Classification',
      'Translation',
      'Summarization',
      'Feature Extraction',
      'Text Generation',
      'Text2Text Generation',
      'Fill-Mask',
      'Sentence Similarity'
    ],
    description: 'Models for understanding and generating human language',
    icon: '💬',
    color: '#f59e0b',
    popularity: 100
  },
  'Audio': {
    name: 'Audio',
    subcategories: [
      'Text-to-Speech',
      'Text-to-Audio',
      'Automatic Speech Recognition',
      'Audio-to-Audio',
      'Audio Classification',
      'Voice Activity Detection'
    ],
    description: 'Models for processing and generating audio content',
    icon: '🎵',
    color: '#8b5cf6',
    popularity: 85
  },
  'Tabular': {
    name: 'Tabular',
    subcategories: [
      'Tabular Classification',
      'Tabular Regression',
      'Time Series Forecasting'
    ],
    description: 'Models for structured data analysis and prediction',
    icon: '📊',
    color: '#06b6d4',
    popularity: 75
  },
  'Reinforcement Learning': {
    name: 'Reinforcement Learning',
    subcategories: [
      'Reinforcement Learning',
      'Robotics'
    ],
    description: 'Models that learn through interaction with environments',
    icon: '🤖',
    color: '#ef4444',
    popularity: 70
  },
  'Other': {
    name: 'Other',
    subcategories: [
      'Graph Machine Learning'
    ],
    description: 'Specialized models for unique use cases',
    icon: '🔗',
    color: '#6b7280',
    popularity: 60
  }
} as const;

const CATEGORY_METADATA: CategoryMetadata = {
  totalCategories: Object.keys(MODEL_CATEGORIES_CONFIG).length,
  totalSubcategories: Object.values(MODEL_CATEGORIES_CONFIG).reduce(
    (total, category) => total + category.subcategories.length, 0
  ),
  categoryTypes: Object.values(CATEGORY_TYPES),
  lastUpdated: '2024-01-01',
  version: '1.0.0'
} as const;

const categoryUtils: CategoryUtility = {
  getCategoryType: (type: keyof CategoryType): string => {
    return CATEGORY_TYPES[type];
  },

  getCategoryLabel: (type: keyof CategoryLabel): string => {
    return CATEGORY_LABELS[type];
  },

  getAllModelCategories: (): ModelCategories => {
    return MODEL_CATEGORIES_CONFIG;
  },

  getModelCategory: (categoryName: string): ModelCategory | undefined => {
    return MODEL_CATEGORIES_CONFIG[categoryName];
  },

  getSubcategories: (categoryName: string): readonly string[] => {
    const category = MODEL_CATEGORIES_CONFIG[categoryName];
    return category?.subcategories || [];
  },

  getAllSubcategories: (): readonly string[] => {
    return Object.values(MODEL_CATEGORIES_CONFIG)
      .flatMap(category => category.subcategories);
  },

  searchCategories: (query: string): readonly string[] => {
    const searchTerm = query.toLowerCase();
    const results: string[] = [];

    Object.entries(MODEL_CATEGORIES_CONFIG).forEach(([categoryName, category]) => {
    
      if (categoryName.toLowerCase().includes(searchTerm)) {
        results.push(categoryName);
      }

      
      category.subcategories.forEach(subcategory => {
        if (subcategory.toLowerCase().includes(searchTerm)) {
          results.push(subcategory);
        }
      });
    });

    return results;
  },

  validateCategory: (categoryName: string, subcategoryName?: string): boolean => {
    const category = MODEL_CATEGORIES_CONFIG[categoryName];
    
    if (!category) {
      return false;
    }

    if (subcategoryName) {
      return category.subcategories.includes(subcategoryName);
    }

    return true;
  },

  getCategoryMetadata: (): CategoryMetadata => {
    return {
      ...CATEGORY_METADATA,
      totalCategories: Object.keys(MODEL_CATEGORIES_CONFIG).length,
      totalSubcategories: Object.values(MODEL_CATEGORIES_CONFIG).reduce(
        (total, category) => total + category.subcategories.length, 0
      )
    };
  },

  getCategoryStats: (): CategoryStats => {
    const categories = Object.values(MODEL_CATEGORIES_CONFIG);
    const totalSubcategories = categories.reduce(
      (total, category) => total + category.subcategories.length, 0
    );

    const sortedCategories = categories
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .map(category => category.name);

    return {
      totalCategories: categories.length,
      totalSubcategories,
      categoriesByType: {
        model: categories.length,
        dataset: 0, 
        infra: 0    
      },
      mostPopularCategories: sortedCategories.slice(0, 5),
      recentlyAdded: [] 
    };
  },

  getPopularCategories: (threshold: number = 80): readonly string[] => {
    return Object.values(MODEL_CATEGORIES_CONFIG)
      .filter(category => (category.popularity || 0) >= threshold)
      .map(category => category.name);
  },

  getCategoriesByFeature: (feature: 'icon' | 'color' | 'description'): readonly string[] => {
    return Object.values(MODEL_CATEGORIES_CONFIG)
      .filter(category => category[feature])
      .map(category => category.name);
  },

  createCustomCategory: (name: string, subcategories: string[], options?: Partial<ModelCategory>): ModelCategory => {
    const customCategory: ModelCategory = {
      name,
      subcategories,
      description: options?.description,
      icon: options?.icon,
      color: options?.color,
      popularity: options?.popularity || 50
    };

    if (!categoryUtils.validateCategory(name)) {
     
    }

    return customCategory;
  }
} as const;

export { CATEGORY_TYPES, CATEGORY_LABELS };
export const MODEL_CATEGORIES = Object.fromEntries(
  Object.entries(MODEL_CATEGORIES_CONFIG).map(([name, category]) => [name, category.subcategories])
);

export { 
  categoryUtils, 
  CATEGORY_METADATA,
  MODEL_CATEGORIES_CONFIG
};

export type { 
  CategoryType, 
  CategoryLabel, 
  ModelCategory, 
  ModelCategories, 
  CategoryMetadata, 
  CategoryUtility, 
  CategoryStats 
};