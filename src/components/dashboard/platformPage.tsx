// src/pages/PlatformPage.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { useTokenName } from '@/contexts/TokenNameContext';


interface Provider {
  id: string;
  providerName: string;
  storage: string;
  memory: string;
  os: string;
  core: string;
  gpu: string;
  processor: string;
  region: string;
  hostingCost: number;
  providerDid: string;
  supportedModels?: string;
}

interface ModelMetadata {
  name: string;
  providers: Provider[];
}

interface ModelData {
  metadata: ModelMetadata;
}

interface PlatformPageProps {
  primaryColor?: string;
}

interface ProviderListProps {
  providers: Provider[];
  selectedIndex: number;
  searchQuery: string;
  onProviderSelect: (index: number) => void;
  onSearchChange: (query: string) => void;
}

interface ProviderDetailsProps {
  provider: Provider;
  tokenName: string;
}

interface LoadingSkeletonProps {
  type: 'header' | 'content';
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface ProviderCardProps {
  provider: Provider;
  isSelected: boolean;
  onClick: () => void;
}

interface SystemSpecsProps {
  provider: Provider;
}

interface ResourceAllocationProps {
  provider: Provider;
}


const LAYOUT_CLASSES = {
  container: 'pb-16 lg:px-12 h-screen',
  header: 'text-gray-900 py-4 text-lg font-semibold',
  mainContent: 'flex',
  providerList: 'w-[40%] rounded-xl',
  providerDetails: 'w-2/3 ms-3 border-s h-screen rounded-xl p-8',
  searchContainer: 'p-4',
  searchWrapper: 'relative',
  searchInput: 'w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-base',
  searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400',
  providerListContainer: 'mt-2',
  providerCard: 'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all',
  providerCardSelected: 'bg-primary/5 border-r-4 border-primary',
  providerCardUnselected: 'hover:bg-gray-50 border-r-4 border-transparent',
  radioInput: 'h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20 border-gray-300',
  providerName: 'font-medium text-gray-900',
  noDataMessage: 'text-gray-900 text-center',
  headerSection: 'flex justify-between items-start mb-6',
  providerTitle: 'text-display-sm text-gray-900',
  providerSubtitle: 'text-body-base text-gray-500 mt-2',
  costSection: 'flex items-center gap-4',
  costContainer: 'text-right',
  costLabel: 'text-body-sm text-gray-500',
  costValue: 'text-display-sm text-primary font-semibold',
  specsGrid: 'grid grid-cols-2 gap-8 mt-8',
  specsSection: 'space-y-4',
  specsTitle: 'text-body-sm font-semibold text-gray-900 mb-4',
  specsContainer: 'space-y-4 bg-gray-50 p-4 rounded-lg',
  specsRow: 'flex justify-between items-center',
  specsLabel: 'text-gray-500',
  specsValue: 'font-medium text-gray-900'
} as const;

const LOADING_CLASSES = {
  headerSkeleton: 'w-[400px] ms-3 border-s p-2 animate-pulse rounded-xl p-3 space-y-6',
  headerBar: 'h-6 bg-gray-200 rounded w-1/3',
  contentSkeleton: 'w-2/3 ms-3 border-s h-screen animate-pulse rounded-xl p-8 space-y-6',
  contentHeader: 'h-6 bg-gray-200 rounded w-1/3',
  contentSubheader: 'h-4 bg-gray-200 rounded w-1/4',
  specsGrid: 'grid grid-cols-2 gap-8 mt-8',
  specsSection: 'space-y-4',
  specsTitle: 'h-4 bg-gray-300 w-1/2 rounded',
  specsContainer: 'bg-gray-100 p-4 rounded-lg space-y-4',
  specsRow: 'flex justify-between',
  specsItem: 'h-3 w-1/4 bg-gray-200 rounded'
} as const;

const ANIMATION_CONFIG = {
  pulse: 'animate-pulse'
} as const;


const normalizeProviderName = (id: string): string => {
  return id?.split("-")?.join(" ");
};

const findProviderByName = (providers: any[], name: string): any => {
  return providers?.find((item: any) => item?.name === name);
};

const filterProvidersBySearch = (providers: Provider[], searchQuery: string): Provider[] => {
  if (!searchQuery) {
    return providers;
  }
  return providers?.filter((provider: Provider) =>
    provider.providerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

const getProviderCardClasses = (isSelected: boolean): string => {
  return isSelected ? LAYOUT_CLASSES.providerCardSelected : LAYOUT_CLASSES.providerCardUnselected;
};

const formatProviderSubtitle = (provider: Provider): string => {
  return `Region: ${provider.region} • ${provider.storage} Storage`;
};

const formatCostDisplay = (cost: number, tokenName: string): string => {
  return `${cost} ${tokenName.toUpperCase()}`;
};


const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type }) => {
  if (type === 'header') {
    return (
      <div className={LOADING_CLASSES.headerSkeleton}>
        <div className={LOADING_CLASSES.headerBar}></div>
      </div>
    );
  }

  return (
    <div className={LOADING_CLASSES.contentSkeleton}>
      <div className={LOADING_CLASSES.contentHeader}></div>
      <div className={LOADING_CLASSES.contentSubheader}></div>
      <div className={LOADING_CLASSES.specsGrid}>
        <div className={LOADING_CLASSES.specsSection}>
          <div className={LOADING_CLASSES.specsTitle}></div>
          <div className={LOADING_CLASSES.specsContainer}>
            <div className={LOADING_CLASSES.specsRow}>
              <div className={LOADING_CLASSES.specsItem}></div>
              <div className={LOADING_CLASSES.specsItem}></div>
            </div>
            <div className={LOADING_CLASSES.specsRow}>
              <div className={LOADING_CLASSES.specsItem}></div>
              <div className={LOADING_CLASSES.specsItem}></div>
            </div>
          </div>
        </div>
        <div className={LOADING_CLASSES.specsSection}>
          <div className={LOADING_CLASSES.specsTitle}></div>
          <div className={LOADING_CLASSES.specsContainer}>
            <div className={LOADING_CLASSES.specsRow}>
              <div className={LOADING_CLASSES.specsItem}></div>
              <div className={LOADING_CLASSES.specsItem}></div>
            </div>
            <div className={LOADING_CLASSES.specsRow}>
              <div className={LOADING_CLASSES.specsItem}></div>
              <div className={LOADING_CLASSES.specsItem}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => {
  return (
    <div className={LAYOUT_CLASSES.searchContainer}>
      <div className={LAYOUT_CLASSES.searchWrapper}>
        <Search className={LAYOUT_CLASSES.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Search providers..."
          className={LAYOUT_CLASSES.searchInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, isSelected, onClick }) => {
  return (
    <div
      className={`${LAYOUT_CLASSES.providerCard} ${getProviderCardClasses(isSelected)}`}
      onClick={onClick}
    >
      <input
        type="radio"
        checked={isSelected}
        onChange={onClick}
        className={LAYOUT_CLASSES.radioInput}
      />
      <span className={LAYOUT_CLASSES.providerName}>{provider.providerName}</span>
    </div>
  );
};

const SystemSpecs: React.FC<SystemSpecsProps> = ({ provider }) => {
  return (
    <div className={LAYOUT_CLASSES.specsSection}>
      <div>
        <h3 className={LAYOUT_CLASSES.specsTitle}>System Specifications</h3>
        <div className={LAYOUT_CLASSES.specsContainer}>
          <div className={LAYOUT_CLASSES.specsRow}>
            <span className={LAYOUT_CLASSES.specsLabel}>Operating System</span>
            <span className={LAYOUT_CLASSES.specsValue}>{provider.os}</span>
          </div>
          <div className={LAYOUT_CLASSES.specsRow}>
            <span className={LAYOUT_CLASSES.specsLabel}>Processor</span>
            <span className={LAYOUT_CLASSES.specsValue}>{provider.processor}</span>
          </div>
          <div className={LAYOUT_CLASSES.specsRow}>
            <span className={LAYOUT_CLASSES.specsLabel}>GPU</span>
            <span className={LAYOUT_CLASSES.specsValue}>{provider.gpu}</span>
          </div>
          <div className={LAYOUT_CLASSES.specsRow}>
            <span className={LAYOUT_CLASSES.specsLabel}>Supports</span>
            <span className={`${LAYOUT_CLASSES.specsValue} truncate`}>
              {provider.supportedModels || "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceAllocation: React.FC<ResourceAllocationProps> = ({ provider }) => {
  return (
    <div className={LAYOUT_CLASSES.specsSection}>
      <div>
        <h3 className={LAYOUT_CLASSES.specsTitle}>Resource Allocation</h3>
        <div className={LAYOUT_CLASSES.specsContainer}>
          <div className={LAYOUT_CLASSES.specsRow}>
            <span className={LAYOUT_CLASSES.specsLabel}>Storage</span>
            <span className={LAYOUT_CLASSES.specsValue}>{provider.storage}</span>
          </div>
          <div className={LAYOUT_CLASSES.specsRow}>
            <span className={LAYOUT_CLASSES.specsLabel}>Memory</span>
            <span className={LAYOUT_CLASSES.specsValue}>{provider.memory}</span>
          </div>
          <div className={LAYOUT_CLASSES.specsRow}>
            <span className={LAYOUT_CLASSES.specsLabel}>Cores</span>
            <span className={LAYOUT_CLASSES.specsValue}>{provider.core}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProviderList: React.FC<ProviderListProps> = ({ 
  providers, 
  selectedIndex, 
  searchQuery, 
  onProviderSelect, 
  onSearchChange 
}) => {
  const filteredProviders = filterProvidersBySearch(providers, searchQuery);

  return (
    <div className={LAYOUT_CLASSES.providerList}>
      <SearchInput value={searchQuery} onChange={onSearchChange} />
      <div className={LAYOUT_CLASSES.providerListContainer}>
        {filteredProviders?.length > 0 ? (
          filteredProviders.map((provider, index) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isSelected={selectedIndex === index}
              onClick={() => onProviderSelect(index)}
            />
          ))
        ) : (
          <p className={LAYOUT_CLASSES.noDataMessage}>No Data Available</p>
        )}
      </div>
    </div>
  );
};

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ provider, tokenName }) => {
  return (
    <div className={LAYOUT_CLASSES.providerDetails}>
      <div className={LAYOUT_CLASSES.headerSection}>
        <div>
          <h2 className={LAYOUT_CLASSES.providerTitle}>{provider.providerName}</h2>
          <p className={LAYOUT_CLASSES.providerSubtitle}>
            {formatProviderSubtitle(provider)}
          </p>
        </div>
        <div className={LAYOUT_CLASSES.costSection}>
          <div className={LAYOUT_CLASSES.costContainer}>
            <p className={LAYOUT_CLASSES.costLabel}>Hosting Cost</p>
            <p className={LAYOUT_CLASSES.costValue}>
              {formatCostDisplay(provider.hostingCost, tokenName)}
            </p>
          </div>
        </div>
      </div>

      <div className={LAYOUT_CLASSES.specsGrid}>
        <SystemSpecs provider={provider} />
        <ResourceAllocation provider={provider} />
      </div>
    </div>
  );
};


const PlatformPage: React.FC<PlatformPageProps> = () => {
  const [selectedProviderIndex, setSelectedProviderIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [model, setModel] = useState<ModelData>({ metadata: { name: '', providers: [] } });
  const { loader, infraProviders } = useAuth();
  const modelData = location.state?.model || null;
  const { id } = useParams();
  const tokenName = useTokenName();

  useEffect(() => {
    if (modelData) {
      setModel(modelData);
    } else if (!loader && infraProviders?.length) {
      const name = normalizeProviderName(id || '');
      const result = findProviderByName(infraProviders, name);
      
      if (!result) {
        navigate('/dashboard/all');
        return;
      }
      
             setModel({
         metadata: {
           name: result?.name || '',
           providers: result?.providers || []
         }
       });
    } else if (!loader && infraProviders?.length) {
      navigate('/dashboard/all');
    }
  }, [modelData, infraProviders, loader, id, navigate]);

  useEffect(() => {
    
  }, [searchQuery]);

  const handleProviderSelect = (index: number) => {
    setSelectedProviderIndex(index);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const selectedProvider = model?.metadata?.providers?.[selectedProviderIndex];

  return (
    <div style={{ paddingTop: 150 }} className={LAYOUT_CLASSES.container}>
      {!loader ? (
        <p className={LAYOUT_CLASSES.header}>
          Providers List - {model?.metadata?.name}
        </p>
      ) : (
        <LoadingSkeleton type="header" />
      )}
      
      <div className={LAYOUT_CLASSES.mainContent}>
        <ProviderList
          providers={model?.metadata?.providers || []}
          selectedIndex={selectedProviderIndex}
          searchQuery={searchQuery}
          onProviderSelect={handleProviderSelect}
          onSearchChange={handleSearchChange}
        />
        
        {loader ? (
          <LoadingSkeleton type="content" />
        ) : (
          selectedProviderIndex >= 0 && selectedProvider && (
            <ProviderDetails
              provider={selectedProvider}
              tokenName={tokenName}
            />
          )
        )}
      </div>
    </div>
  );
};

export default PlatformPage;