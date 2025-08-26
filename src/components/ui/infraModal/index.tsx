

import { useAuth } from "@/hooks"
import { ModelCard } from "../ModelCard"
import { useCallback, useEffect, useState } from "react"
import { Search } from "lucide-react";
import { useTokenName } from '@/contexts/TokenNameContext';


interface InfraProvider {
  id: string;
  providerName: string;
  providerDid: string;
  region: string;
  storage: string;
  hostingCost: number;
  os: string;
  processor: string;
  gpu: string;
  supportedModels?: string;
  memory: string;
  core: string;
  endpoints?: any;
}

interface Platform {
  name: string;
  description: string;
  likes?: number;
  providers: InfraProvider[];
}

interface InfraModalProps {
  onselectProvider: (provider: {
    providerDid: string;
    hostingCost: number;
    endpoints?: any;
  }) => void;
}

interface PlatformGridProps {
  infraProviders: Platform[];
  onPlatformSelect: (platform: Platform) => void;
}

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface ProviderListProps {
  providers: InfraProvider[];
  selectedIndex: number;
  onProviderSelect: (index: number) => void;
}

interface ProviderDetailsProps {
  platform: Platform;
  selectedProviderIndex: number;
  tokenName: string;
  onSelectProvider: (provider: {
    providerDid: string;
    hostingCost: number;
    endpoints?: any;
  }) => void;
}

interface SpecItemProps {
  label: string;
  value: string | undefined;
}


const LAYOUT_CLASSES = {
  container: 'infra-modal-container',
  platformGrid: 'grid grid-cols-1 md:grid-cols-2 gap-6 m-3',
  platformCard: 'cursor-pointer',
  providerSection: 'flex',
  providerList: 'w-[40%] rounded-xl',
  providerDetails: 'w-2/3 ms-3 border-s rounded-xl p-8',
  searchContainer: 'p-4',
  searchInput: 'w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-base',
  searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400',
  providerItem: 'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all',
  providerItemSelected: 'bg-primary/5 border-r-4 border-primary',
  providerItemHover: 'hover:bg-gray-50 border-r-4 border-transparent',
  radioInput: 'h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20 border-gray-300',
  noDataText: 'text-gray-900 text-center',
  sectionTitle: 'text-gray-900 py-4 text-lg font-semibold',
  providerName: 'text-display-sm text-gray-900',
  providerInfo: 'text-body-base text-gray-500 mt-2',
  costLabel: 'text-body-sm text-gray-500',
  costValue: 'text-display-sm text-primary font-semibold',
  specsGrid: 'grid grid-cols-2 gap-8 mt-8',
  specsSection: 'space-y-4',
  specsTitle: 'text-body-sm font-semibold text-gray-900 mb-4',
  specsContainer: 'space-y-4 bg-gray-50 p-4 rounded-lg',
  specItem: 'flex justify-between items-center',
  specLabel: 'text-gray-500',
  specValue: 'font-medium text-gray-900',
  selectButton: 'px-4 py-2 bg-primary self-end text-white rounded-lg text-body-base font-medium hover:bg-primary-hover transition-all shadow-sm hover:shadow-md',
  buttonContainer: 'flex justify-end mt-1'
} as const;

const ANIMATION_CONFIG = {
  transition: 'transition-all',
  hover: 'hover:bg-gray-50',
  focus: 'focus:ring-2 focus:ring-primary/20'
} as const;


const infraModalUtils = {
  
  filterProviders: (providers: InfraProvider[], searchQuery: string): InfraProvider[] => {
    if (!searchQuery) {
      return providers;
    }
    return providers.filter((provider: InfraProvider) =>
      provider.providerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  },

  
  createModelCardData: (platform: Platform) => ({
    type: "upload" as const,
    model: {
      metadata: {
        ...platform,
        name: platform.name,
        description: platform.description,
      },
      likes: platform.likes || 0,
    },
    isLiked: false,
    onLike: () => { }
  }),

  
  createProviderSelectionData: (platform: Platform, selectedIndex: number) => ({
    providerDid: platform.providers[selectedIndex].providerDid,
    hostingCost: platform.providers[selectedIndex].hostingCost,
    endpoints: platform.providers[selectedIndex]?.endpoints,
  }),

  
  getProviderItemClasses: (isSelected: boolean): string => {
    return `${LAYOUT_CLASSES.providerItem} ${
      isSelected ? LAYOUT_CLASSES.providerItemSelected : LAYOUT_CLASSES.providerItemHover
    }`;
  }
} as const;


const SpecItem: React.FC<SpecItemProps> = ({ label, value }) => (
  <div className={LAYOUT_CLASSES.specItem}>
    <span className={LAYOUT_CLASSES.specLabel}>{label}</span>
    <span className={LAYOUT_CLASSES.specValue}>{value || "-"}</span>
  </div>
);

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => (
  <div className={LAYOUT_CLASSES.searchContainer}>
    <div className="relative">
      <Search className={LAYOUT_CLASSES.searchIcon} size={20} />
      <input
        type="text"
        placeholder="Search providers..."
        className={LAYOUT_CLASSES.searchInput}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  </div>
);

const ProviderList: React.FC<ProviderListProps> = ({ providers, selectedIndex, onProviderSelect }) => (
  <div className="mt-2">
    {providers.length > 0 ? (
      providers.map((provider: InfraProvider, index: number) => (
        <div
          key={provider.id}
          className={infraModalUtils.getProviderItemClasses(selectedIndex === index)}
          onClick={() => onProviderSelect(index)}
        >
          <input
            type="radio"
            checked={selectedIndex === index}
            onChange={() => onProviderSelect(index)}
            className={LAYOUT_CLASSES.radioInput}
          />
          <span className="font-medium text-gray-900">{provider?.providerName}</span>
        </div>
      ))
    ) : (
      <p className={LAYOUT_CLASSES.noDataText}>No Data Available</p>
    )}
  </div>
);

const PlatformGrid: React.FC<PlatformGridProps> = ({ infraProviders, onPlatformSelect }) => (
  <div className={LAYOUT_CLASSES.platformGrid}>
    {infraProviders.map((provider: Platform, index: number) => (
      <div 
        onClick={() => onPlatformSelect(provider)} 
        key={index} 
        className={LAYOUT_CLASSES.platformCard}
      >
        <ModelCard {...infraModalUtils.createModelCardData(provider)} />
      </div>
    ))}
  </div>
);

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ 
  platform, 
  selectedProviderIndex, 
  tokenName, 
  onSelectProvider 
}) => {
  const selectedProvider = platform.providers[selectedProviderIndex];

  return (
    <div className={LAYOUT_CLASSES.providerDetails}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className={LAYOUT_CLASSES.providerName}>{selectedProvider?.providerName}</h2>
          <p className={LAYOUT_CLASSES.providerInfo}>
            <strong>Region:</strong> {selectedProvider?.region} • {selectedProvider?.storage} Storage
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={LAYOUT_CLASSES.costLabel}>Hosting Cost</p>
            <p className={LAYOUT_CLASSES.costValue}>
              {selectedProvider?.hostingCost} {tokenName.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className={LAYOUT_CLASSES.specsGrid}>
        <div className={LAYOUT_CLASSES.specsSection}>
          <div>
            <h3 className={LAYOUT_CLASSES.specsTitle}>System Specifications</h3>
            <div className={LAYOUT_CLASSES.specsContainer}>
              <SpecItem label="Operating System" value={selectedProvider?.os} />
              <SpecItem label="Processor" value={selectedProvider?.processor} />
              <SpecItem label="GPU" value={selectedProvider?.gpu} />
              <SpecItem label="Supports" value={selectedProvider?.supportedModels} />
            </div>
          </div>
        </div>

        <div className={LAYOUT_CLASSES.specsSection}>
          <div>
            <h3 className={LAYOUT_CLASSES.specsTitle}>Resource Allocation</h3>
            <div className={LAYOUT_CLASSES.specsContainer}>
              <SpecItem label="Storage" value={selectedProvider?.storage} />
              <SpecItem label="Memory" value={selectedProvider?.memory} />
              <SpecItem label="Cores" value={selectedProvider?.core} />
            </div>
          </div>
        </div>
      </div>

      <div className={LAYOUT_CLASSES.buttonContainer}>
        <button
          onClick={() => onSelectProvider(infraModalUtils.createProviderSelectionData(platform, selectedProviderIndex))}
          className={LAYOUT_CLASSES.selectButton}
        >
          Select Provider
        </button>
      </div>
    </div>
  );
};


export function InfraModal({ onselectProvider }: InfraModalProps) {
  const { infraProviders } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedProviderIndex, setSelectedProviderIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const tokenName = useTokenName();


  const filteredProviders = useCallback(() => {
    if (!selectedPlatform) return [];
    return infraModalUtils.filterProviders(selectedPlatform.providers, searchQuery);
  }, [searchQuery, selectedPlatform]);


  useEffect(() => {
    if (!selectedPlatform) {
      return;
    }
    filteredProviders();
  }, [searchQuery, selectedPlatform, filteredProviders]);


  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setSelectedProviderIndex(0);
    setSearchQuery('');
  };


  const handleProviderSelect = (index: number) => {
    setSelectedProviderIndex(index);
  };


  const handleSelectProvider = (provider: {
    providerDid: string;
    hostingCost: number;
    endpoints?: any;
  }) => {
    onselectProvider(provider);
  };

  return (
    <div className={LAYOUT_CLASSES.container}>
      {!selectedPlatform ? (
        <PlatformGrid 
          infraProviders={infraProviders} 
          onPlatformSelect={handlePlatformSelect} 
        />
      ) : (
        <div style={{ paddingTop: 10 }}>
          <p className={LAYOUT_CLASSES.sectionTitle}>
            Providers List - {selectedPlatform?.name}
          </p>
          
          <div className={LAYOUT_CLASSES.providerSection}>
            
            <div className={LAYOUT_CLASSES.providerList}>
              <SearchBar 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
              />
              <ProviderList
                providers={filteredProviders()}
                selectedIndex={selectedProviderIndex}
                onProviderSelect={handleProviderSelect}
              />
            </div>

           
            {selectedProviderIndex >= 0 && (
              <ProviderDetails
                platform={selectedPlatform}
                selectedProviderIndex={selectedProviderIndex}
                tokenName={tokenName}
                onSelectProvider={handleSelectProvider}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export type { 
  InfraModalProps, 
  InfraProvider, 
  Platform, 
  ProviderListProps, 
  ProviderDetailsProps,
  SearchBarProps,
  SpecItemProps
};


export { ANIMATION_CONFIG, infraModalUtils };