import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import { API_PORTS } from '@/config/network';


export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    serviceType?: 'daap' | 'node' | string;
    NFTDataReply?: any[];
    artifactPath?: string;
    metadatPath?: string;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
    data: T;
    success: boolean;
    message?: string;
}


class ApiErrorHandler {
    private static showToast(message: string, type: 'error' | 'success' = 'error') {
        toast[type](message, { position: 'top-center' });
    }

    static handleHttpError(error: AxiosError): ApiError {
        const status = error.response?.status;
        const data = error.response?.data as any;

        switch (status) {
            case 401:
                return { message: 'Unauthorized access', status };
            
            case 403:
                this.showToast('You do not have permission to perform this action');
                return { message: 'Forbidden', status };
            
            case 404:
                this.showToast('Resource not found');
                return { message: 'Resource not found', status };
            
            case 422:
                const validationErrors = data?.errors;
                if (validationErrors) {
                    Object.values(validationErrors).forEach((error: any) => {
                        this.showToast(error[0]);
                    });
                }
                return { message: 'Validation error', status, errors: validationErrors };
            
            case 504:
                this.showToast('The server is taking too long to respond. Please try again later.');
                return { message: 'Gateway timeout', status };
            
            default:
                return { message: data?.message || 'An unexpected error occurred', status };
        }
    }

    static handleNetworkError(error: AxiosError): ApiError {
        if (error.message === 'Network Error') {
            this.showToast('Network error. Please check your connection.');
            return { message: 'Network error' };
        }

        if (error.code === 'ECONNABORTED') {
            this.showToast('Request timed out. Please try again.');
            return { message: 'Request timeout' };
        }

        return { message: 'An unexpected error occurred' };
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
        return config;
    }

    static configureBaseURL(config: CustomAxiosRequestConfig): CustomAxiosRequestConfig {
        const serviceType = config.serviceType || 'node';
        config.baseURL = API_PORTS[serviceType];
        return config;
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
        return response?.data;
    },
    async (error: AxiosError) => {
       

        let apiError: ApiError;

        if (error.response) {
            apiError = ApiErrorHandler.handleHttpError(error);
        } else if (error.request) {
            apiError = ApiErrorHandler.handleNetworkError(error);
        } else {
            apiError = { message: 'An unexpected error occurred' };
        }

        return Promise.reject(apiError);
    }
);


export const apiUtils = {
    get: <T = any>(url: string, config?: CustomAxiosRequestConfig): Promise<T> => {
        return api.get(url, config);
    },

    post: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig): Promise<T> => {
        return api.post(url, data, config);
    },

    put: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig): Promise<T> => {
        return api.put(url, data, config);
    },

    delete: <T = any>(url: string, config?: CustomAxiosRequestConfig): Promise<T> => {
        return api.delete(url, config);
    },

    patch: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig): Promise<T> => {
        return api.patch(url, data, config);
    },

    upload: <T = any>(url: string, formData: FormData, config?: CustomAxiosRequestConfig): Promise<T> => {
        return api.post(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default api;
export { ApiErrorHandler, RequestConfigurator };