import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        serviceType?: string;
        NFTDataReply?: any[];
        artifactPath?: string;
        metadatPath?: string;
    }
}

export type ServiceType = 'node' | 'dapp' | 'faucet' | 'metrics' | 'comp';

export interface ApiEndpoints {
    node: string;
    dapp: string;
    faucet: string;
    metrics: string;
    comp: string;
}

interface ErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

export const API_ENDPOINTS: ApiEndpoints = {
    node: 'https://dev-api.xellwallet.com:444/api/',
    dapp: 'https://dev-api.xellwallet.com:8443/api/',
    faucet: 'https://trie-faucet-api.trie.network',
    metrics: 'https://dev-api.xellwallet.com:8443/',
    comp: 'https://dev-api.xellwallet.com:8448'
};

const api = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (config.serviceType && API_ENDPOINTS[config.serviceType as ServiceType]) {
            config.baseURL = API_ENDPOINTS[config.serviceType as ServiceType];
        }

        if (config.data instanceof FormData) {
            config.headers['Accept'] = 'multipart/form-data';
            config.headers['Content-Type'] = 'multipart/form-data';
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },
    (error: AxiosError<ErrorResponse>) => {
        const { response } = error;
        const toastOptions = { position: 'top-center' as const };

        switch (response?.status) {
            case 401:
                break;

            case 403:
                toast.error('You do not have permission to perform this action', toastOptions);
                break;

            case 404:
                toast.error('Resource not found', toastOptions);
                break;

            case 422:
                handleValidationErrors(response.data?.errors);
                break;

            case 504:
                toast.error('The server is taking too long to respond. Please try again later.', toastOptions);
                break;

            default:
                handleGenericErrors(error);
        }

        return Promise.reject(error);
    }
);

function handleValidationErrors(errors?: Record<string, string[]>) {
    if (!errors) return;

    Object.values(errors).forEach((errorMessages) => {
        if (errorMessages.length > 0) {
            toast.error(errorMessages[0]);
        }
    });
}

function handleGenericErrors(error: AxiosError) {
    const toastOptions = { position: 'top-center' as const };

    if (error.message === 'Network Error') {
        toast.error('Network error. Please check your connection.', toastOptions);
    } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.', toastOptions);
    }
}

export default api;