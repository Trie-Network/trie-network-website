import { NFTData } from '@/types/nft';


export const parseNFTMetadata = (nft: NFTData): NFTData => {
  try {
    return {
      ...nft,
      metadata: JSON.parse(nft.nft_metadata || '{}')
    };
  } catch {
    return {
      ...nft,
      metadata: {}
    };
  }
};


export const filterNFTsByCompetition = (nfts: NFTData[], compId: string): NFTData[] => {
  return nfts.filter(item => item && item.metadata && item.metadata.compId === compId);
};


export const filterNonCompetitionNFTs = (nfts: NFTData[]): NFTData[] => {
  return nfts.filter(item => item && item.metadata && !item.metadata.compId).reverse();
};


