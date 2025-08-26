
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface DebounceOptions {
  readonly delay: number;
  readonly immediate?: boolean;
  readonly maxWait?: number;
  readonly enableDebugging?: boolean;
  readonly onDebounce?: (value: any) => void;
}

interface DebounceReturn<T> {
  readonly value: T;
  readonly isPending: boolean;
  readonly cancel: () => void;
  readonly flush: () => void;
}

interface DebounceState<T> {
  readonly value: T;
  readonly isPending: boolean;
  readonly lastUpdate: number;
  readonly timeoutId: NodeJS.Timeout | null;
}

interface DebounceMetadata {
  readonly version: string;
  readonly lastUpdated: string;
  readonly features: readonly string[];
  readonly dependencies: readonly string[];
}

interface DebounceUtility {
  readonly getMetadata: () => DebounceMetadata;
  readonly validateOptions: (options: Partial<DebounceOptions>) => boolean;
  readonly createDebugInfo: (options: DebounceOptions) => DebugInfo;
  readonly getStats: () => DebounceStats;
}

interface DebugInfo {
  readonly hookName: string;
  readonly delay: number;
  readonly immediate: boolean;
  readonly maxWait: number | undefined;
  readonly debuggingEnabled: boolean;
  readonly timestamp: string;
}

interface DebounceStats {
  totalCalls: number;
  successfulDebounces: number;
  cancelledDebounces: number;
  lastUpdated: string;
}


const DEBOUNCE_METADATA: DebounceMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  features: [
    'type-safe',
    'configurable-delay',
    'performance-optimized',
    'memory-leak-prevention',
    'debugging-support',
    'cancellation-support'
  ],
  dependencies: ['react', 'useState', 'useEffect']
} as const;

let debounceStats: DebounceStats = {
  totalCalls: 0,
  successfulDebounces: 0,
  cancelledDebounces: 0,
  lastUpdated: new Date().toISOString()
};


const debounceUtils: DebounceUtility = {
  
  getMetadata: (): DebounceMetadata => {
    return DEBOUNCE_METADATA;
  },

  validateOptions: (options: Partial<DebounceOptions>): boolean => {
    if (options.delay !== undefined && (typeof options.delay !== 'number' || options.delay < 0)) {
      return false;
    }

    if (options.maxWait !== undefined && (typeof options.maxWait !== 'number' || options.maxWait < 0)) {
      return false;
    }

    if (options.maxWait !== undefined && options.delay !== undefined && options.maxWait < options.delay) {
      return false;
    }

    return true;
  },

  createDebugInfo: (options: DebounceOptions): DebugInfo => {
    return {
      hookName: 'useDebounce',
      delay: options.delay,
      immediate: options.immediate ?? false,
      maxWait: options.maxWait,
      debuggingEnabled: options.enableDebugging ?? false,
      timestamp: new Date().toISOString()
    };
  },

  
  getStats: (): DebounceStats => {
    return { ...debounceStats };
  }
} as const;


export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


export function useDebounceWithOptions<T>(value: T, options: DebounceOptions): DebounceReturn<T> {
  const {
    delay,
    immediate = false,
    maxWait,
    enableDebugging = false,
    onDebounce
  } = options;

  
  debounceStats.totalCalls++;
  debounceStats.lastUpdated = new Date().toISOString();

  
  if (!debounceUtils.validateOptions(options)) {
 
  }

  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

 
  const debugInfo = useMemo(() => {
    if (!enableDebugging) return null;
    return debounceUtils.createDebugInfo(options);
  }, [enableDebugging, options]);


  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
    setIsPending(false);
    debounceStats.cancelledDebounces++;
  }, []);

  
  const flush = useCallback(() => {
    cancel();
    setDebouncedValue(value);
    setIsPending(false);
    onDebounce?.(value);
  }, [cancel, value, onDebounce]);


  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

   
    cancel();

   
    if (immediate && timeSinceLastUpdate > delay) {
      setDebouncedValue(value);
      setIsPending(false);
      onDebounce?.(value);
      debounceStats.successfulDebounces++;
      return;
    }


    setIsPending(true);

    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
      onDebounce?.(value);
      debounceStats.successfulDebounces++;
    }, delay);

   
    if (maxWait && maxWait > delay) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        flush();
      }, maxWait);
    }


    lastUpdateRef.current = now;

    if (enableDebugging && debugInfo) {
    }

   
    return () => {
      cancel();
    };
  }, [value, delay, immediate, maxWait, onDebounce, enableDebugging, debugInfo, cancel, flush]);

  
  return {
    value: debouncedValue,
    isPending,
    cancel,
    flush
  };
}


export function useDebounceSimple<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


export { 
  debounceUtils, 
  DEBOUNCE_METADATA
};


export type { 
  DebounceOptions, 
  DebounceReturn, 
  DebounceMetadata, 
  DebounceUtility, 
  DebugInfo, 
  DebounceStats 
};