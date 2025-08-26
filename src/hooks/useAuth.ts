

/**
 * useAuth Hook
 * 
 * Custom React hook for accessing authentication context.
 * Provides type-safe access to authentication state and utilities.
 * 
 * Features:
 * - Type-safe authentication access
 * - Context validation and error handling
 * - Performance optimization
 * - Comprehensive error messages
 * - Extensible authentication utilities
 * - Hook metadata and documentation
 * - Fallback mechanisms
 * - Development debugging support
 */

import { useContext, useMemo, useCallback } from 'react';
import { AuthContext } from '@/contexts/auth';


interface UseAuthOptions {
  readonly enableValidation?: boolean;
  readonly enableDebugging?: boolean;
  readonly fallbackValue?: any;
}

interface UseAuthReturn {
  readonly context: any;
  readonly isValid: boolean;
  readonly error: string | null;
  readonly debugInfo: DebugInfo;
}

interface DebugInfo {
  readonly hookName: string;
  readonly contextType: string;
  readonly validationEnabled: boolean;
  readonly debuggingEnabled: boolean;
  readonly timestamp: string;
}

interface AuthHookMetadata {
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: readonly string[];
  readonly dependencies: readonly string[];
}

interface AuthHookUtility {
  readonly getHookMetadata: () => AuthHookMetadata;
  readonly validateAuthContext: (context: any) => boolean;
  readonly createDebugInfo: (options: UseAuthOptions) => DebugInfo;
  readonly getHookStats: () => AuthHookStats;
}

interface AuthHookStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastUpdated: string;
}


const AUTH_HOOK_METADATA: AuthHookMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'context-access',
    'type-safety',
    'error-handling',
    'performance-optimized',
    'debugging-support',
    'validation'
  ],
  dependencies: ['react', 'auth-context']
} as const;


let hookStats: AuthHookStats = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  lastUpdated: new Date().toISOString()
};


const authHookUtils: AuthHookUtility = {
 
  getHookMetadata: (): AuthHookMetadata => {
    return AUTH_HOOK_METADATA;
  },

 
  validateAuthContext: (context: any): boolean => {
    if (!context) {
      return false;
    }

  
    const hasValidStructure = typeof context === 'object' && 
      (context.isAuthenticated !== undefined || 
       context.login !== undefined || 
       context.logout !== undefined ||
       context.connectedWallet !== undefined);
    
    return hasValidStructure;
  },

 
  createDebugInfo: (options: UseAuthOptions): DebugInfo => {
    return {
      hookName: 'useAuth',
      contextType: 'AuthContext',
      validationEnabled: options.enableValidation ?? true,
      debuggingEnabled: options.enableDebugging ?? false,
      timestamp: new Date().toISOString()
    };
  },

 
  getHookStats: (): AuthHookStats => {
    return { ...hookStats };
  }
} as const;


export function useAuth(options: UseAuthOptions = {}): any {
  const {
    enableValidation = true,
    enableDebugging = false,
    fallbackValue = null
  } = options;

  
  hookStats.totalCalls++;
  hookStats.lastUpdated = new Date().toISOString();

  
  const context = useContext(AuthContext);
  
  
  const isValid = useMemo(() => {
    if (!enableValidation) return true;
    return authHookUtils.validateAuthContext(context);
  }, [context, enableValidation]);

  
  const error = useMemo(() => {
    if (!context) {
      return 'useAuth must be used within an AuthProvider';
    }
    
    if (enableValidation && !isValid) {
      return 'Invalid authentication context structure';
    }
    
    return null;
  }, [context, isValid, enableValidation]);

  
  const debugInfo = useMemo(() => {
    if (!enableDebugging) {
      return null;
    }
    return authHookUtils.createDebugInfo(options);
  }, [enableDebugging, options]);

  
  if (error) {
    hookStats.failedCalls++;
    
    if (fallbackValue !== null) {
      
      return fallbackValue;
    }
    
    throw new Error(error);
  }

  
  hookStats.successfulCalls++;

  
  if (enableDebugging && debugInfo) {
    return {
      ...context,
      _debug: debugInfo,
      _isValid: isValid
    };
  }

  return context;
}


export function useAuthEnhanced(options: UseAuthOptions = {}): UseAuthReturn {
  const {
    enableValidation = true,
    enableDebugging = true,
    fallbackValue = null
  } = options;

  
  const context = useContext(AuthContext);
  
  
  const isValid = useMemo(() => {
    if (!enableValidation) return true;
    return authHookUtils.validateAuthContext(context);
  }, [context, enableValidation]);

  
  const error = useMemo(() => {
    if (!context) {
      return 'useAuth must be used within an AuthProvider';
    }
    
    if (enableValidation && !isValid) {
      return 'Invalid authentication context structure';
    }
    
    return null;
  }, [context, isValid, enableValidation]);

  
  const debugInfo = useMemo(() => {
    return authHookUtils.createDebugInfo(options);
  }, [options]);

  return {
    context: context || fallbackValue,
    isValid,
    error,
    debugInfo
  };
}


export function useAuthSimple(): any {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}


export { 
  authHookUtils, 
  AUTH_HOOK_METADATA
};


export type { 
  UseAuthOptions, 
  UseAuthReturn, 
  DebugInfo, 
  AuthHookMetadata, 
  AuthHookUtility, 
  AuthHookStats 
};