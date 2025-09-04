import { Model, NFTData } from './types';

export const createModelFromNFT = (nft: NFTData): Model => ({
    name: nft.metadata?.name || nft.nft,
    model: nft.nft,
    selected: false,
    provider: nft.metadata?.provider || {},
    price: parseFloat(nft.nft_value || '0') || 0,
});

export const calculateCharCountPercentage = (text: string, maxChars: number): number => {
    return (text.length / maxChars) * 100;
};

export const isNearLimit = (percentage: number): boolean => percentage > 80;
export const isAtLimit = (text: string, maxChars: number): boolean => text.length >= maxChars;

export const formatModelName = (modelName: string): string => {
    return modelName.replace(/:/g, ' - ').replace(/_/g, ' ');
};

export const getStorageKey = (prefix: string, key: string): string => {
    return `${prefix}${key}`;
};

export const saveToStorage = (prefix: string, key: string, data: any): void => {
    try {
        localStorage.setItem(getStorageKey(prefix, key), JSON.stringify(data));
    } catch (error) {
        // Handle storage error silently
    }
};

export const loadFromStorage = <T,>(prefix: string, key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(getStorageKey(prefix, key));
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        return false;
    }
};

