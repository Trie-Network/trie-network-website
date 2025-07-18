import { Model } from '@/types/models';
import { useColors } from '@/hooks';
import { componentStyles } from '@/utils';

interface SidebarProps {
  item: Model;
  selectedDataset: string;
  selectedInfra: string;
  showTryButton: boolean;
  onDatasetChange: (value: string) => void;
  onInfraChange: (value: string) => void;
  onPurchase: () => void;
  uploading?: boolean;
}

export function Sidebar({
  uploading,
  item,

  onPurchase
}: SidebarProps) {
  const { colors } = useColors();

  return (
    <div className="space-y-6">
      <div className={`${componentStyles.container.card} overflow-hidden`}>
        <img src={'/modelph.png'} alt={item?.metadata?.name} className="w-full h-48 object-cover" />
      </div>

      <div className={`${componentStyles.container.card} p-6`}>
        <button
          style={item?.metadata?.compId ? { display: 'none' } : {}}
          disabled={uploading}
          onClick={onPurchase}
          className={`w-full ${componentStyles.button.primary} text-sm font-medium flex items-center justify-center gap-2`}
        >
          {uploading ? <div className="flex justify-center items-center ">
            <div className="loader border-t-transparent border-solid border-2 border-white-500 rounded-full animate-spin w-6 h-6"></div>
          </div> :
            <>
              <span>Buy Now</span>
              <span className="text-white/80">{parseFloat(item?.nft_value || "0") * 1000} TRIE</span>
            </>}
        </button>
      </div>
    </div>
  );
}