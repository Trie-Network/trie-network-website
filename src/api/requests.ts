import axios from 'axios';
import api, { API_ENDPOINTS, ServiceType } from './axios';

interface GetNftsByDidParams {
    did: string;
    [key: string]: any;
}

interface GetMetaByNftIdParams {
    id: string;
}

interface GetUsageHistoryParams {
    nft: string;
}

interface AuthenticationPayload {
    did?: string;
    token?: string;
    wallet?: string;
    [key: string]: any;
}

interface GetRatingByAssetParams {
    asset?: string;
    asset_id?: string;
    [key: string]: any;
}

interface RequestFtParams {
    amount?: number;
    recipient?: string;
    username?: string;
    ftCount?: number;
    [key: string]: any;
}

declare module 'axios' {
    export interface AxiosRequestConfig {
        serviceType?: ServiceType;
    }
}

export const COMP_SERVER = {

    authDid: (payload: AuthenticationPayload) => {
        return axios.post(`${API_ENDPOINTS.comp}/did`, payload);
    },

    authenticate: (payload: AuthenticationPayload) => {
        return axios.post(`${API_ENDPOINTS.comp}/authenticate`, payload);
    }
};

export const END_POINTS = {

    get_nfts_by_did: (params: GetNftsByDidParams) => {
        return api.get('get-nfts-by-did', {
            params,
            serviceType: 'node'
        });
    },

    get_meta_by_nft_id: (params: GetMetaByNftIdParams) => {
        return api.get(`upload_asset/get_artifact_info_by_cid/${params.id}`, {
            serviceType: 'dapp'
        });
    },

    get_artifact_by_nft_id: (params: GetMetaByNftIdParams) => {
        return api.get(`upload_asset/get_artifact_file_name/${params.id}`, {
            serviceType: 'dapp'
        });
    },

    get_usage_history: (params: GetUsageHistoryParams) => {
        return api.get('get-nft-token-chain-data', {
            params,
            serviceType: 'node'
        });
    },

    list_nfts: () => {
        return api.get('list-nfts', {
            serviceType: 'node'
        });
    },

    upload_files: (data: FormData) => {
        return api.post('upload_asset/upload_artifacts', data, {
            serviceType: 'dapp'
        });
    },

    download_artifact: (params: GetMetaByNftIdParams) => {
        return api.get(`download_artifact/${params.id}`, {
            serviceType: 'dapp'
        });
    },

    get_ft_info_by_did: (params: GetNftsByDidParams) => {
        return api.get('get-ft-info-by-did', {
            params,
            serviceType: 'node'
        });
    },

    request_ft: (params: RequestFtParams) => {
        return api.post('increment', params, {
            serviceType: 'faucet'
        });
    },

    providers: () => {
        return api.get('onboarded_providers', {
            serviceType: 'dapp'
        });
    },

    get_rating_by_asset: (params: GetRatingByAssetParams) => {
        return api.get('get_rating_by_asset', {
            params,
            serviceType: 'dapp'
        });
    },

    get_asset_count: () => {
        return api.get('metrics/asset_count', {
            serviceType: 'metrics'
        });
    },

    get_transaction_count: () => {
        return api.get('metrics/transaction_count', {
            serviceType: 'metrics'
        });
    },

    upload_obj: (url: string, formData: FormData) => {
        return axios.post(url, formData);
    },

    get_credit_balance_by_did: (did: string) => {
        return api.get(`credit_balance/${did}`, {
            serviceType: 'dapp'
        });
    }
};
