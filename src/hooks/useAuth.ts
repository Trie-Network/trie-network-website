

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
import { AuthContextType, AuthError, AuthValidationResult } from '@/types/auth';

interface UseAuthOptions {
  readonly enableValidation?: boolean;
  readonly enableDebugging?: boolean;
  readonly fallbackValue?: AuthContextType | null;
  readonly onError?: (error: AuthError) => void;
}

interface UseAuthReturn {
  readonly context: AuthContextType | null;
  readonly isValid: boolean;
  readonly error: AuthError | null;
  readonly debugInfo: DebugInfo | null;
  readonly validationResult: AuthValidationResult;
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
  readonly validateAuthContext: (context: AuthContextType | null) => AuthValidationResult;
  readonly createDebugInfo: (options: UseAuthOptions) => DebugInfo;
  readonly getHookStats: () => AuthHookStats;
  readonly createAuthError: (code: AuthError['code'], message: string, details?: string) => AuthError;
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

  validateAuthContext: (context: AuthContextType | null): AuthValidationResult => {
    const errors: AuthError[] = [];
    const warnings: string[] = [];

    if (!context) {
      errors.push({
        code: 'CONTEXT_MISSING',
        message: 'Authentication context is not available',
        details: 'useAuth must be used within an AuthProvider',
        timestamp: new Date().toISOString()
      });
      return { isValid: false, errors, warnings };
    }

    // Check for required authentication properties
    const requiredProps: (keyof AuthContextType)[] = [
      'isAuthenticated',
      'login',
      'logout',
      'connectWallet',
      'connectedWallet'
    ];

    const missingProps = requiredProps.filter(prop => context[prop] === undefined);
    
    if (missingProps.length > 0) {
      errors.push({
        code: 'INVALID_CONTEXT',
        message: 'Authentication context is missing required properties',
        details: `Missing: ${missingProps.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Check for wallet connection issues
    if (context.isAuthenticated && !context.connectedWallet) {
      warnings.push('User is authenticated but no wallet is connected');
    }

    // Check for authentication method availability
    if (typeof context.login !== 'function') {
      warnings.push('Login method is not properly implemented');
    }

    if (typeof context.logout !== 'function') {
      warnings.push('Logout method is not properly implemented');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
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
  },

  createAuthError: (code: AuthError['code'], message: string, details?: string): AuthError => {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    };
  }
} as const;

/**
 * Main useAuth hook with comprehensive error handling and validation
 * @param options - Configuration options for the hook
 * @returns The authentication context with validation results
 */
export function useAuth(options: UseAuthOptions = {}): AuthContextType {
  const {
    enableValidation = true,
    enableDebugging = false,
    fallbackValue = null,
    onError
  } = options;

  hookStats.totalCalls++;
  hookStats.lastUpdated = new Date().toISOString();

  const context = useContext(AuthContext);

  const validationResult = useMemo(() => {
    if (!enableValidation) {
      return { isValid: true, errors: [], warnings: [] };
    }
    return authHookUtils.validateAuthContext(context);
  }, [context, enableValidation]);

  const error = useMemo(() => {
    if (!context) {
      const authError = authHookUtils.createAuthError(
        'CONTEXT_MISSING',
        'useAuth must be used within an AuthProvider'
      );
      return authError;
    }
    
    if (enableValidation && !validationResult.isValid) {
      return validationResult.errors[0] || null;
    }
    
    return null;
  }, [context, validationResult, enableValidation]);

  const debugInfo = useMemo(() => {
    if (!enableDebugging) return null;
    return authHookUtils.createDebugInfo(options);
  }, [enableDebugging, options]);

  if (error) {
    hookStats.failedCalls++;
    
    // Call error callback if provided
    if (onError) {
      onError(error);
    }
    
    if (fallbackValue !== null) {
      return fallbackValue;
    }
    
    throw new Error(`${error.code}: ${error.message}${error.details ? ` - ${error.details}` : ''}`);
  }

  hookStats.successfulCalls++;

  if (enableDebugging && debugInfo) {
    // Return context with debug information attached
    return {
      ...context!,
      _debug: debugInfo,
      _isValid: validationResult.isValid
    } as AuthContextType & { _debug: DebugInfo; _isValid: boolean };
  }

  return context!;
}

/**
 * Enhanced useAuth hook that returns validation details and error information
 * @param options - Configuration options for the hook
 * @returns Object containing context, validation results, and error information
 */
export function useAuthEnhanced(options: UseAuthOptions = {}): UseAuthReturn {
  const {
    enableValidation = true,
    enableDebugging = true,
    fallbackValue = null
  } = options;

  const context = useContext(AuthContext);

  const validationResult = useMemo(() => {
    if (!enableValidation) {
      return { isValid: true, errors: [], warnings: [] };
    }
    return authHookUtils.validateAuthContext(context);
  }, [context, enableValidation]);

  const error = useMemo(() => {
    if (!context) {
      return authHookUtils.createAuthError(
        'CONTEXT_MISSING',
        'useAuth must be used within an AuthProvider'
      );
    }
    
    if (enableValidation && !validationResult.isValid) {
      return validationResult.errors[0] || null;
    }
    
    return null;
  }, [context, validationResult, enableValidation]);

  const debugInfo = useMemo(() => {
    return authHookUtils.createDebugInfo(options);
  }, [options]);

  return {
    context: context || fallbackValue,
    isValid: validationResult.isValid,
    error,
    debugInfo,
    validationResult
  };
}

/**
 * Simple useAuth hook with minimal validation and error handling
 * @returns The authentication context or throws an error if not available
 */
export function useAuthSimple(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    const error = authHookUtils.createAuthError(
      'CONTEXT_MISSING',
      'useAuth must be used within an AuthProvider'
    );
    throw new Error(`${error.code}: ${error.message}`);
  }
  
  return context;
}

/**
 * Hook for handling authentication errors with custom error handling
 * @param onError - Callback function for handling authentication errors
 * @returns Object with error handling utilities
 */
export function useAuthErrorHandler(onError?: (error: AuthError) => void) {
  const handleAuthError = useCallback((error: AuthError) => {
    if (onError) {
      onError(error);
    } else {
      console.error('Authentication error:', error);
    }
  }, [onError]);

  const createWalletConnectionError = useCallback((details?: string) => {
    return authHookUtils.createAuthError(
      'WALLET_CONNECTION_FAILED',
      'Failed to connect wallet',
      details
    );
  }, []);

  const createAuthenticationError = useCallback((details?: string) => {
    return authHookUtils.createAuthError(
      'AUTHENTICATION_FAILED',
      'Authentication failed',
      details
    );
  }, []);

  return {
    handleAuthError,
    createWalletConnectionError,
    createAuthenticationError
  };
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