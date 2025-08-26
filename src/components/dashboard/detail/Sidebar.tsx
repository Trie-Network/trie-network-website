import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Model } from '@/types/models';
import { TOKEN_NAME } from '@/config/network';
import { useTokenName } from '@/contexts/TokenNameContext';
import { getNetworkColor, getNetworkHoverColor, NETWORK_COLORS } from '../../../config/colors';
import { useLoader } from '@/contexts/LoaderContext';



interface SidebarProps {
  item: Model;
  showTryButton: boolean;
  onPurchase: () => void;
  uploading?: boolean;
}

interface BuyButtonProps {
  item: Model;
  onPurchase: () => void;
  isLoading: boolean;
  tokenName: string;
}

interface TryButtonProps {
  selectedModel: string | null;
  onTryClick: () => void;
}


const ITEM_TYPES = {
  MODEL: 'model'
} as const;

const BUTTON_STATES = {
  LOADING: 'loading',
  READY: 'ready',
  DISABLED: 'disabled'
} as const;


const getItemType = (item: Model): string => {
  return item.type?.toLowerCase() || '';
};

const isModelType = (itemType: string): boolean => {
  return itemType === ITEM_TYPES.MODEL;
};

const formatTokenAmount = (nftValue: string, tokenName: string): string => {
  const amount = parseFloat(nftValue || "0") * 1000;
  return `${amount} ${tokenName.toUpperCase()}`;
};

const getButtonStyle = (isLoading: boolean, networkColor: string) => ({
  backgroundColor: isLoading ? undefined : networkColor
});


const ItemImage = ({ item }: { item: Model }) => (
  <div className="bg-white rounded-xl border border-[#e1e3e5] overflow-hidden">
    <img 
      src={'/modelph.png'} 
      alt={item?.metadata?.name} 
      className="w-full h-48 object-cover" 
    />
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="loader border-t-transparent border-solid border-2 border-white-500 rounded-full animate-spin w-6 h-6"></div>
  </div>
);

const BuyButton = ({ item, onPurchase, isLoading, tokenName }: BuyButtonProps) => {
  const shouldShow = !item?.metadata?.compId;
  
  if (!shouldShow) return null;

  return (
    <button
      style={getButtonStyle(isLoading, getNetworkColor())}
      disabled={isLoading}
      onClick={onPurchase}
      className="w-full px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = getNetworkHoverColor())}
      onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = getNetworkColor())}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <span>Buy Now</span>
          <span className="text-white/80">
            {formatTokenAmount(item?.nft_value || "0", tokenName)}
          </span>
        </>
      )}
    </button>
  );
};

const TryButton = ({ selectedModel, onTryClick }: TryButtonProps) => {
  const isEnabled = !!selectedModel;
  
  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <button
        className={`w-full px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
          isEnabled 
            ? `border-[${getNetworkColor()}] text-[${getNetworkColor()}]`
            : 'border-gray-300 text-gray-400 cursor-not-allowed'
        }`}
        style={isEnabled ? { borderColor: getNetworkColor(), color: getNetworkColor() } : {}}
        onMouseEnter={(e) => isEnabled && (e.currentTarget.style.backgroundColor = `rgba(${NETWORK_COLORS.primaryRgb}, 0.1)`)}
        onMouseLeave={(e) => isEnabled && (e.currentTarget.style.backgroundColor = 'transparent')}
        disabled={!isEnabled}
        onClick={onTryClick}
      >
        Try in Playground
      </button>
    </div>
  );
};


export function Sidebar({
  uploading,
  item,
  showTryButton = true,
  onPurchase
}: SidebarProps) {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const tokenName = useTokenName();
  const { loaders } = useLoader();

  const itemType = getItemType(item);
  const isModel = isModelType(itemType);

  useEffect(() => {
  
    if (showTryButton) {
      setSelectedModel(String(item?.nft));
    } else {
      setSelectedModel(null);
    }
  }, [showTryButton, item]);

  const handleTryClick = () => {
 
    if (selectedModel) {
      navigate(`/playground?model=${selectedModel}`);
    }
  };

  return (
    <div className="w-full lg:w-80 space-y-6">
      <ItemImage item={item} />

      <div className="bg-white rounded-xl border border-[#e1e3e5] p-6">
        <BuyButton 
          item={item}
          onPurchase={onPurchase}
          isLoading={loaders.buyingAsset}
          tokenName={tokenName}
        />

        
        {isModel && (
          <>
          
            <TryButton 
              selectedModel={selectedModel}
              onTryClick={handleTryClick}
            />
          </>
        )}
      </div>
    </div>
  );
}