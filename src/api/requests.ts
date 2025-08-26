
import axios from "axios";
import api from "./axios";
import { API_PORTS } from '@/config/network';


export interface AuthPayload {
    did?: string;
    signature?: string;
    message?: string;
    [key: string]: any;
}

export interface NFTParams {
    id?: string;
    did?: string;
    [key: string]: any;
}

export interface CreditPayload {
    did: string;
    [key: string]: any;
}

export interface UploadData {
    files?: File[];
    metadata?: any;
    [key: string]: any;
}


export const COMP_SERVER = {
    authDid: (payload: AuthPayload) => {
        return axios.post(`${API_PORTS.comp}/did`, payload);
    },
    
    authenticate: (payload: AuthPayload) => {
        return axios.post(`${API_PORTS.comp}/authenticate`, payload);
    }
} as const;

const NFT_ENDPOINTS = {
    getNftsByDid: (params: NFTParams) => {
        return api.get('get-nfts-by-did', {
            params,
            serviceType: "node"
        } as any);
    },

    getMetaByNftId: (params: NFTParams) => {
        return api.get(`upload_asset/get_artifact_info_by_cid/${params?.id}`, {
            serviceType: 'dapp'
        } as any);
    },

    getArtifactByNftId: (params: NFTParams) => {
        return api.get(`upload_asset/get_artifact_file_name/${params?.id}`, {
            serviceType: 'dapp'
        } as any);
    },

    getUsageHistory: (params: NFTParams) => {
        return api.get(`get-nft-token-chain-data`, {
            params,
            serviceType: "node"
        } as any);
    },

    listNfts: () => {
        return api.get(`list-nfts`, {
            serviceType: "node"
        } as any);
    },

    downloadArtifact: (params: NFTParams) => {
        return api.get(`download_artifact/${params?.id}`, {
            serviceType: "dapp"
        } as any);
    }
} as const;

const ASSET_ENDPOINTS = {
    uploadFiles: (data: UploadData) => {
        return api.post(`upload_asset/upload_artifacts`, data, { 
            serviceType: "dapp" 
        } as any);
    },

    getRatingByAsset: (params: NFTParams) => {
        return api.get(`get_rating_by_asset`, {
            params,
            serviceType: "dapp"
        } as any);
    },

    uploadObj: (url: string, fd: FormData) => {
        return axios.post(url, fd);
    }
} as const;


const FT_ENDPOINTS = {
    getFtInfoByDid: (params: NFTParams) => {
        return api.get(`get-ft-info-by-did`, {
            params,
            serviceType: "node"
        } as any);
    },

    requestFt: (params: NFTParams) => {
        return api.post(`increment`, params, {
            serviceType: "faucet"
        } as any);
    }
} as const;


const PROVIDER_ENDPOINTS = {
    getProviders: () => {
        return api.get(`onboarded_providers`, {
            serviceType: "dapp"
        } as any);
    }
} as const;


const METRICS_ENDPOINTS = {
    getAssetCount: () => {
        return api.get(`metrics/asset_count`, {
            serviceType: "metrics"
        } as any);
    },

    getTransactionCount: () => {
        return api.get(`metrics/transaction_count`, {
            serviceType: "metrics"
        } as any);
    }
} as const;


const CREDIT_ENDPOINTS = {
    getCreditBalanceByDid: (did: string) => {
        return api.get(`credit_balance/${did}`, {
            serviceType: 'dapp'
        } as any);
    },

    deductCredits: (payload: CreditPayload) => {
        return api.post(`deduct_credits`, payload, {
            serviceType: 'dapp'
        } as any);
    }
} as const;


export const END_POINTS = {

    get_nfts_by_did: NFT_ENDPOINTS.getNftsByDid,
    get_meta_by_nft_id: NFT_ENDPOINTS.getMetaByNftId,
    get_articfact_by_nft_id: NFT_ENDPOINTS.getArtifactByNftId,
    get_usage_history: NFT_ENDPOINTS.getUsageHistory,
    list_nfts: NFT_ENDPOINTS.listNfts,
    download_artifact: NFT_ENDPOINTS.downloadArtifact,


    upload_files: ASSET_ENDPOINTS.uploadFiles,
    get_rating_by_asset: ASSET_ENDPOINTS.getRatingByAsset,
    upload_obj: ASSET_ENDPOINTS.uploadObj,


    get_ft_info_by_did: FT_ENDPOINTS.getFtInfoByDid,
    request_ft: FT_ENDPOINTS.requestFt,


    providers: PROVIDER_ENDPOINTS.getProviders,


    get_asset_count: METRICS_ENDPOINTS.getAssetCount,
    get_transaction_count: METRICS_ENDPOINTS.getTransactionCount,


    get_credit_balance_by_did: CREDIT_ENDPOINTS.getCreditBalanceByDid,
    deduct_credits: CREDIT_ENDPOINTS.deductCredits
} as const;


export {
    NFT_ENDPOINTS,
    ASSET_ENDPOINTS,
    FT_ENDPOINTS,
    PROVIDER_ENDPOINTS,
    METRICS_ENDPOINTS,
    CREDIT_ENDPOINTS
};
