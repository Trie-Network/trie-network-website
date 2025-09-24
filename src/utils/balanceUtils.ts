
import { END_POINTS } from '../api/requests';

interface BalanceResponse {
  readonly 'credit '?: {
    readonly credit?: number;
  };
  readonly data?: {
    readonly 'credit '?: {
      readonly credit?: number;
    };
    readonly credit?: number;
    readonly balance?: number;
  } | number;
}

interface BalanceOptions {
  readonly enableDebugging?: boolean;
  readonly onError?: (error: Error) => void;
  readonly fallbackValue?: number;
}

const balanceUtils = {
  extractCreditValue: (response: any): number => {
    if (!response) return 0;

    if (response["credit "]?.credit !== undefined) {
      return response["credit "].credit;
    }
    
    if (response.data?.["credit "]?.credit !== undefined) {
      return response.data["credit "].credit;
    }
    
    if (response.data?.credit !== undefined) {
      return response.data.credit;
    }
    
    if (response.data?.balance !== undefined) {
      return response.data.balance;
    }
    
    if (typeof response.data === 'number') {
      return response.data;
    }
    
    if (typeof response === 'number') {
      return response;
    }
    
    return 0;
  },

  validateDid: (did: string): boolean => {
    return typeof did === 'string' && did.trim().length > 0;
  },

  safeNumberConversion: (value: any, fallback: number = 0): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }
} as const;

export const fetchInferenceBalance = async (
  did: string, 
  options: BalanceOptions = {}
): Promise<number | null> => {
  const { 
    enableDebugging = false, 
    onError, 
    fallbackValue = 0 
  } = options;

  if (!balanceUtils.validateDid(did)) {
    return null;
  }
  
  try {
    const res = await END_POINTS.get_credit_balance_by_did(did);
    const creditValue = balanceUtils.extractCreditValue(res);
    return creditValue;
  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    }
    
    
    return fallbackValue;
  }
};


export const fetchInferenceBalanceSimple = async (did: string): Promise<number> => {
  try {
    const balance = await fetchInferenceBalance(did, { fallbackValue: 0 });
    return balance ?? 0;
  } catch {
    return 0;
  }
};

export { balanceUtils };

export type { BalanceOptions, BalanceResponse };
