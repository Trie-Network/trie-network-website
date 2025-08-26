
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
  }
} as const;

export const fetchInferenceBalance = async (
  did: string, 
  options: BalanceOptions = {}
): Promise<number | null> => {
  const { enableDebugging = false, onError } = options;

  if (!balanceUtils.validateDid(did)) {
    if (enableDebugging) {
      
    }
    return null;
  }
  
  try {
    if (enableDebugging) {
     
    }

    const res = await END_POINTS.get_credit_balance_by_did(did);
    
    if (enableDebugging) {
   
    }

    const creditValue = balanceUtils.extractCreditValue(res);
    
    if (enableDebugging) {
     
    }

    return creditValue;
  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    }
    
    if (enableDebugging) {
    
    }
    
    return 0;
  }
};


export const fetchInferenceBalanceSimple = async (did: string): Promise<number | null> => {
  if (!did) {
   
  }
  
  try {
 
    const res = await END_POINTS.get_credit_balance_by_did(did);
  
    let creditValue = 0;
    
    if (res?.["credit "]?.credit !== undefined) {
      creditValue = res["credit "].credit;
    } else if (res?.data?.["credit "]?.credit !== undefined) {
      creditValue = res.data["credit "].credit;
    } else if (res?.data?.credit !== undefined) {
      creditValue = res.data.credit;
    } else if (res?.data?.balance !== undefined) {
      creditValue = res.data.balance;
    } else if (typeof res?.data === 'number') {
      creditValue = res.data;
    } else if (typeof res === 'number') {
      creditValue = res;
    }
    
    return creditValue;
  } catch (error) {
    return 0;
  }
};

export { balanceUtils };

export type { BalanceOptions, BalanceResponse };
