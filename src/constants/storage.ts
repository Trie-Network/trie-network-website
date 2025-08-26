
export const STORAGE_KEYS = {

  WALLET_DETAILS: 'wallet_details',
  
  USER_UPLOADS_MODELS: 'user_uploads_models',
  USER_UPLOADS_DATASETS: 'user_uploads_datasets',
  USER_UPLOADS_INFRA: 'user_uploads_infra',
  USER_MODELS: 'user_models',
  USER_DATASETS: 'user_datasets',
  USER_INFRA: 'user_infra',
  
 
  HACKATHON_REGISTERED: 'hackathon_registered',
  
  
  LS_PREFIX: 'playground_',
  LS_PROJECTS: 'playground_projects',
  
  
  MODEL_REVIEW: 'model_review',
  DATASET_REVIEW: 'dataset_review',
  INFRA_REVIEW: 'infra_review',
  
  
  DASHBOARD_MODELS: 'dashboard_models',
  DASHBOARD_DATASETS: 'dashboard_datasets',
  DASHBOARD_INFRA: 'dashboard_infra'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];


export const storageUtils = {
 
  getItem: <T>(key: StorageKey, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse localStorage item for key: ${key}`, error);
      return defaultValue;
    }
  },

  
  setItem: <T>(key: StorageKey, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set localStorage item for key: ${key}`, error);
    }
  },

  
  removeItem: (key: StorageKey): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage item for key: ${key}`, error);
    }
  },

  
  hasItem: (key: StorageKey): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Failed to check localStorage item for key: ${key}`, error);
      return false;
    }
  },

  
  getBoolean: (key: StorageKey, defaultValue: boolean = false): boolean => {
    try {
      const stored = localStorage.getItem(key);
      return stored === 'true' ? true : stored === 'false' ? false : defaultValue;
    } catch (error) {
      console.warn(`Failed to get boolean from localStorage for key: ${key}`, error);
      return defaultValue;
    }
  },

  
  setBoolean: (key: StorageKey, value: boolean): void => {
    try {
      localStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Failed to set boolean in localStorage for key: ${key}`, error);
    }
  }
} as const;
