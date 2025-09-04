import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { toast } from 'react-hot-toast';
import { API_PORTS } from '@/config/network';

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    serviceType?: 'daap' | 'node' | string;
    NFTDataReply?: any[];
    artifactPath?: string;
    metadatPath?: string;
    retryCount?: number;
    maxRetries?: number;
    retryDelay?: number;
    shouldRetry?: ((error: AxiosError) => boolean) | false;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
    retryCount?: number;
    isRetryable?: boolean;
    originalError?: AxiosError;
}

export interface ApiResponse<T = any> {
    data: T;
    success: boolean;
    message?: string;
}

export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
}

export interface RequestMetricsData {
    requestId: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    retryCount: number;
    status?: number;
    success: boolean;
}

class RetryManager {
    private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitter: true
    };

    private static readonly RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
    private static readonly RETRYABLE_ERROR_CODES = ['ECONNABORTED', 'ECONNRESET', 'ETIMEDOUT'];

    static shouldRetryRequest(error: AxiosError, config: CustomAxiosRequestConfig): boolean {
        if (config.shouldRetry === false) return false;
        
        const currentRetries = config.retryCount || 0;
        const maxRetries = config.maxRetries || this.DEFAULT_RETRY_CONFIG.maxRetries;
        if (currentRetries >= maxRetries) return false;

        if (config.shouldRetry && typeof config.shouldRetry === 'function') {
            return config.shouldRetry(error);
        }

        return this.isRetryableError(error);
    }

    static isRetryableError(error: AxiosError): boolean {
        if (!error.response && error.request) {
            return true;
        }

        if (error.response?.status && this.RETRYABLE_STATUS_CODES.includes(error.response.status)) {
            return true;
        }

        if (error.code && this.RETRYABLE_ERROR_CODES.includes(error.code)) {
            return true;
        }

        return false;
    }

    static calculateRetryDelay(config: CustomAxiosRequestConfig, retryConfig: RetryConfig = this.DEFAULT_RETRY_CONFIG): number {
        const currentRetries = config.retryCount || 0;
        const baseDelay = config.retryDelay || retryConfig.baseDelay;
        
        let delay = baseDelay * Math.pow(retryConfig.backoffMultiplier, currentRetries);
        
        delay = Math.min(delay, retryConfig.maxDelay);
        
        if (retryConfig.jitter) {
            const jitter = Math.random() * 0.3 + 0.85; // 85% to 115%
            delay *= jitter;
        }
        
        return Math.floor(delay);
    }

    static async executeWithRetry<T>(
        requestFn: () => Promise<T>,
        config: CustomAxiosRequestConfig,
        retryConfig: RetryConfig = this.DEFAULT_RETRY_CONFIG
    ): Promise<T> {
        let lastError: AxiosError;
        
        for (let attempt = 0; attempt <= (config.maxRetries || retryConfig.maxRetries); attempt++) {
            try {
                config.retryCount = attempt;
                return await requestFn();
            } catch (error) {
                lastError = error as AxiosError;
                
                if (!this.shouldRetryRequest(lastError, config)) {
                    break;
                }
                
                console.warn(`Request failed, retrying... (${attempt + 1}/${config.maxRetries || retryConfig.maxRetries})`, {
                    url: config.url,
                    method: config.method,
                    error: lastError.message
                });
                
                if (attempt < (config.maxRetries || retryConfig.maxRetries)) {
                    const delay = this.calculateRetryDelay(config, retryConfig);
                    await this.sleep(delay);
                }
            }
        }
        
        throw lastError!;
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class ApiErrorHandler {
    private static showToast(message: string, type: 'error' | 'success' | 'warning' = 'error') {
        toast[type](message, { 
            position: 'top-center',
            duration: type === 'error' ? 5000 : 3000
        });
    }

    static handleHttpError(error: AxiosError): ApiError {
        const status = error.response?.status;
        const data = error.response?.data as any;
        const config = error.config as CustomAxiosRequestConfig;

        let message: string;
        let isRetryable = false;

        switch (status) {
            case 400:
                message = data?.message || 'Bad request';
                break;
            
            case 401:
                message = 'Unauthorized access. Please log in again.';
                this.handleAuthError(error);
                break;
            
            case 403:
                message = 'You do not have permission to perform this action';
                break;
            
            case 404:
                message = 'Resource not found';
                break;
            
            case 408:
                message = 'Request timeout';
                isRetryable = true;
                break;
            
            case 422:
                const validationErrors = data?.errors;
                if (validationErrors) {
                    Object.values(validationErrors).forEach((error: any) => {
                        this.showToast(error[0], 'warning');
                    });
                }
                message = 'Validation error';
                break;
            
            case 429:
                message = 'Too many requests. Please try again later.';
                isRetryable = true;
                break;
            
            case 500:
                message = 'Internal server error';
                isRetryable = true;
                break;
            
            case 502:
                message = 'Bad gateway';
                isRetryable = true;
                break;
            
            case 503:
                message = 'Service temporarily unavailable';
                isRetryable = true;
                break;
            
            case 504:
                message = 'Gateway timeout';
                isRetryable = true;
                break;
            
            default:
                message = data?.message || 'An unexpected error occurred';
                break;
        }

        return {
            message,
            status,
            errors: data?.errors,
            retryCount: config?.retryCount || 0,
            isRetryable,
            originalError: error
        };
    }

    static handleNetworkError(error: AxiosError): ApiError {
        const config = error.config as CustomAxiosRequestConfig;
        let message: string;
        let isRetryable = false;

        if (error.message === 'Network Error') {
            message = 'Network error. Please check your connection.';
            isRetryable = true;
        } else if (error.code === 'ECONNABORTED') {
            message = 'Request timed out. Please try again.';
            isRetryable = true;
        } else if (error.code === 'ECONNRESET') {
            message = 'Connection was reset. Please try again.';
            isRetryable = true;
        } else if (error.code === 'ETIMEDOUT') {
            message = 'Connection timed out. Please try again.';
            isRetryable = true;
        } else {
            message = 'An unexpected network error occurred';
            isRetryable = true;
        }

        this.showToast(message, 'error');

        return {
            message,
            retryCount: config?.retryCount || 0,
            isRetryable,
            originalError: error
        };
    }

    private static handleAuthError(error: AxiosError): void {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { 
            detail: { error, timestamp: Date.now() } 
        }));
        
        console.warn('Authentication error detected, triggering auth flow');
    }
}

class RequestConfigurator {
    static configureHeaders(config: CustomAxiosRequestConfig): CustomAxiosRequestConfig {
        if (config.data instanceof FormData) {
            config.headers = {
                ...config.headers,
                'accept': 'multipart/form-data',
                'Content-Type': 'multipart/form-data',
            } as any;
        }
        
        config.headers = {
            ...config.headers,
            'X-Request-ID': this.generateRequestId(),
            'X-Client-Timestamp': Date.now().toString(),
        } as any;
        
        return config;
    }

    static configureBaseURL(config: CustomAxiosRequestConfig): CustomAxiosRequestConfig {
        const serviceType = config.serviceType || 'node';
        config.baseURL = API_PORTS[serviceType];
        return config;
    }

    static configureRetry(config: CustomAxiosRequestConfig): CustomAxiosRequestConfig {
        if (config.maxRetries === undefined) {
            config.maxRetries = 3;
        }
        if (config.retryDelay === undefined) {
            config.retryDelay = 1000;
        }
        if (config.shouldRetry === undefined) {
            config.shouldRetry = RetryManager.isRetryableError;
        }
        
        return config;
    }

    private static generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

class RequestMetrics {
    private static metrics = new Map<string, RequestMetricsData>();

    static startRequest(config: CustomAxiosRequestConfig): string {
        const requestId = config.headers?.['X-Request-ID'] as string || this.generateRequestId();
        
        this.metrics.set(requestId, {
            requestId,
            startTime: Date.now(),
            retryCount: 0,
            success: false
        });
        
        return requestId;
    }

    static endRequest(requestId: string, success: boolean, status?: number, retryCount?: number): void {
        const metric = this.metrics.get(requestId);
        if (metric) {
            metric.endTime = Date.now();
            metric.duration = metric.endTime - metric.startTime;
            metric.success = success;
            metric.status = status;
            if (retryCount !== undefined) {
                metric.retryCount = retryCount;
            }
        }
    }

    static getMetrics(): RequestMetricsData[] {
        return Array.from(this.metrics.values());
    }

    static clearMetrics(): void {
        this.metrics.clear();
    }

    private static generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 30000,
});

api.interceptors.request.use(
    (config: CustomAxiosRequestConfig) => {
        try {
            config = RequestConfigurator.configureBaseURL(config);
            config = RequestConfigurator.configureHeaders(config);
            config = RequestConfigurator.configureRetry(config);
            
            RequestMetrics.startRequest(config);
            
            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        const requestId = response.config.headers?.['X-Request-ID'] as string;
        if (requestId) {
            RequestMetrics.endRequest(requestId, true, response.status);
        }
        
        return response?.data;
    },
    async (error: AxiosError) => {
        const config = error.config as CustomAxiosRequestConfig;
        const requestId = config?.headers?.['X-Request-ID'] as string;
        
        if (requestId) {
            RequestMetrics.endRequest(requestId, false, error.response?.status, config?.retryCount);
        }

        let apiError: ApiError;

        if (error.response) {
            apiError = ApiErrorHandler.handleHttpError(error);
        } else if (error.request) {
            apiError = ApiErrorHandler.handleNetworkError(error);
        } else {
            apiError = { 
                message: 'An unexpected error occurred',
                retryCount: config?.retryCount || 0,
                isRetryable: false,
                originalError: error
            };
        }

        return Promise.reject(apiError);
    }
);

export const apiUtils = {
    get: <T = any>(url: string, config?: CustomAxiosRequestConfig): Promise<T> => {
        const defaultConfig: CustomAxiosRequestConfig = {
            headers: {} as AxiosRequestHeaders,
            ...config
        };
        return RetryManager.executeWithRetry(
            () => api.get(url, defaultConfig),
            defaultConfig
        );
    },

    post: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig): Promise<T> => {
        const defaultConfig: CustomAxiosRequestConfig = {
            headers: {} as AxiosRequestHeaders,
            ...config
        };
        return RetryManager.executeWithRetry(
            () => api.post(url, data, defaultConfig),
            defaultConfig
        );
    },

    put: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig): Promise<T> => {
        const defaultConfig: CustomAxiosRequestConfig = {
            headers: {} as AxiosRequestHeaders,
            ...config
        };
        return RetryManager.executeWithRetry(
            () => api.put(url, data, defaultConfig),
            defaultConfig
        );
    },

    delete: <T = any>(url: string, config?: CustomAxiosRequestConfig): Promise<T> => {
        const defaultConfig: CustomAxiosRequestConfig = {
            headers: {} as AxiosRequestHeaders,
            ...config
        };
        return RetryManager.executeWithRetry(
            () => api.delete(url, defaultConfig),
            defaultConfig
        );
    },

    patch: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig): Promise<T> => {
        const defaultConfig: CustomAxiosRequestConfig = {
            headers: {} as AxiosRequestHeaders,
            ...config
        };
        return RetryManager.executeWithRetry(
            () => api.patch(url, data, defaultConfig),
            defaultConfig
        );
    },

    upload: <T = any>(url: string, formData: FormData, config?: CustomAxiosRequestConfig): Promise<T> => {
        const defaultConfig: CustomAxiosRequestConfig = {
            headers: {} as AxiosRequestHeaders,
            ...config
        };
        return RetryManager.executeWithRetry(
            () => api.post(url, formData, {
                ...defaultConfig,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }),
            defaultConfig
        );
    },

    withRetry: <T = any>(
        requestFn: () => Promise<T>,
        retryConfig: Partial<RetryConfig> = {}
    ): Promise<T> => {
        const config: CustomAxiosRequestConfig = {
            headers: {} as AxiosRequestHeaders,
            maxRetries: retryConfig.maxRetries || 3,
            retryDelay: retryConfig.baseDelay || 1000,
            shouldRetry: RetryManager.isRetryableError
        };
        
        return RetryManager.executeWithRetry(requestFn, config);
    },

    getMetrics: () => RequestMetrics.getMetrics(),
    
    clearMetrics: () => RequestMetrics.clearMetrics()
};

export default api;
export { 
    ApiErrorHandler, 
    RequestConfigurator, 
    RetryManager, 
    RequestMetrics
};