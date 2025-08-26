import { useState, useMemo, useEffect } from 'react';
import { ModelCard, SearchInput, EmptyState, FilterButton, Pagination, MobileFilterDrawer, ModelCardSkeleton, Skeleton } from '@/components/ui';
import { useAuth, useFilteredItems } from '@/hooks';
import { getNetworkColor } from '../../config/colors';


interface CategoryIcon {
  icon: string;
  color: string;
}

interface CategoryIcons {
  [key: string]: CategoryIcon;
}

interface DatasetModalities {
  Modalities: string[];
  [key: string]: string[];
}

interface FormatCategories {
  'File Formats': string[];
  'Folder Types': string[];
  [key: string]: string[];
}

interface DatasetsViewProps {
  primaryColor?: string;
  compId?: string;
}

interface FilterSectionProps {
  title: string;
  items: string[];
  categoryIcons?: CategoryIcons;
  selectedFilters: Set<string>;
  onFilterSelect: (item: string) => void;
  isFormatSection?: boolean;
}

interface MobileFilterButtonProps {
  onClick: () => void;
  selectedFiltersCount: number;
  primaryColor: string;
}

interface FilterHeaderProps {
  selectedFiltersCount: number;
  onClearFilters: () => void;
  primaryColor: string;
}

interface DatasetGridProps {
  datasets: any[];
  likedItems: Record<string, boolean>;
  onLike: (itemId: string, likes: string) => void;
  isLoading: boolean;
}

interface EmptyStateProps {
  hasFilters: boolean;
}


const ITEMS_PER_PAGE = 12;

const CATEGORY_ICONS: CategoryIcons = {
  '3D': {
    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    color: 'bg-gradient-to-br from-blue-500 to-indigo-500'
  },
  'Audio': {
    icon: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500'
  },
  'Geospatial': {
    icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
    color: 'bg-gradient-to-br from-amber-500 to-orange-500'
  },
  'Image': {
    icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
    color: 'bg-gradient-to-br from-green-500 to-emerald-500'
  },
  'Tabular': {
    icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5c-.621 0-1.125-.504-1.125-1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125M10.875 16.5h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M18.375 16.5c.621 0 1.125.504 1.125 1.125M3.375 5.625c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-1.5A1.125 1.125 0 013.375 7.125v-1.5zm17.25 0c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125v-1.5zm-17.25 12c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5zm17.25 0c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125v-1.5z',
    color: 'bg-gradient-to-br from-red-500 to-rose-500'
  },
  'Text': {
    icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
    color: 'bg-gradient-to-br from-cyan-500 to-blue-500'
  },
  'Time-series': {
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    color: 'bg-gradient-to-br from-violet-500 to-purple-500'
  },
  'Video': {
    icon: 'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z',
    color: 'bg-gradient-to-br from-fuchsia-500 to-pink-500'
  }
};

const DATASET_MODALITIES: DatasetModalities = {
  'Modalities': [
    '3D',
    'Audio',
    'Geospatial',
    'Image',
    'Tabular',
    'Text',
    'Time-series',
    'Video'
  ]
};

const FORMAT_CATEGORIES: FormatCategories = {
  'File Formats': [
    'json',
    'csv',
    'parquet',
    'arrow'
  ],
  'Folder Types': [
    'imagefolder',
    'soundfolder',
    'webdataset',
    'text'
  ]
};

const LAYOUT_CLASSES = {
  container: 'grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-112px)] pt-6 pb-16 px-4 md:px-6 lg:px-8',
  mainContent: 'lg:col-span-3 h-[calc(100vh-112px)] overflow-y-auto pb-16 scrollbar-hide',
  sidebar: 'space-y-6 h-[calc(100vh-112px)] overflow-y-auto pr-4 -mr-4 pb-16 scrollbar-hide w-[280px]',
  filterSection: 'bg-white rounded-xl shadow-sm border border-[#e1e3e5] p-6',
  filterTitle: 'text-lg font-semibold text-gray-900',
  filterItems: 'space-y-2',
  formatButton: 'w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2',
  formatIcon: 'w-5 h-5 bg-gradient-to-br from-gray-500 to-gray-600 rounded flex items-center justify-center text-white',
  formatText: 'font-mono',
  mobileFilterButton: 'inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50',
  selectedCount: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white',
  datasetGrid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  clearFiltersButton: 'text-sm flex items-center gap-1'
} as const;

const SKELETON_CONFIG = {
  filterCount: 3,
  skeletonItems: 4,
  datasetSkeletons: 6
} as const;


const filterItemsBySearch = (
  items: Record<string, string[]>,
  searchQuery: string
): Record<string, string[]> => {
  if (!searchQuery) return items;

  const query = searchQuery.toLowerCase();
  const filtered: Record<string, string[]> = {};

  Object.entries(items).forEach(([category, itemList]) => {
    const matchingItems = itemList.filter(item =>
      item.toLowerCase().includes(query)
    );
    filtered[category] = matchingItems;
  });

  return filtered;
};

const getFilteredCategories = (searchQuery: string): DatasetModalities => {
  return filterItemsBySearch(DATASET_MODALITIES, searchQuery) as unknown as DatasetModalities;
};

const getFilteredFormats = (searchQuery: string): FormatCategories => {
  return filterItemsBySearch(FORMAT_CATEGORIES, searchQuery) as unknown as FormatCategories;
};

const getDatasetData = (nftData: any[], compId?: string, compNftData?: any): any[] => {
  if (!nftData?.length) {
    return [];
  }

  let filteredData = nftData;
  if (compId && compNftData?.[compId]) {
    filteredData = compNftData[compId];
  }

  return filteredData?.filter((item: any) => item?.metadata?.type === 'dataset') || [];
};


const FilterSection = ({ 
  title, 
  items, 
  categoryIcons, 
  selectedFilters, 
  onFilterSelect, 
  isFormatSection = false 
}: FilterSectionProps) => (
  <div className={LAYOUT_CLASSES.filterSection}>
    <div className="mb-4">
      <h2 className={LAYOUT_CLASSES.filterTitle}>{title}</h2>
    </div>
    <div className={LAYOUT_CLASSES.filterItems}>
      {items.map((item) => (
        isFormatSection ? (
          <button
            key={item}
            className={LAYOUT_CLASSES.formatButton}
          >
            <div className={LAYOUT_CLASSES.formatIcon}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <span className={LAYOUT_CLASSES.formatText}>.{item}</span>
          </button>
        ) : (
          <FilterButton
            key={item}
            label={item}
            icon={categoryIcons?.[item]?.icon || ''}
            color={categoryIcons?.[item]?.color || ''}
            isSelected={selectedFilters.has(item)}
            onSelect={() => onFilterSelect(item)}
            onRemove={() => onFilterSelect(item)}
          />
        )
      ))}
    </div>
  </div>
);

const MobileFilterButton = ({ onClick, selectedFiltersCount, primaryColor }: MobileFilterButtonProps) => (
  <button
    type="button"
    className={LAYOUT_CLASSES.mobileFilterButton}
    onClick={onClick}
  >
    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
    Filters
    {selectedFiltersCount > 0 && (
      <span 
        className={LAYOUT_CLASSES.selectedCount} 
        style={{ backgroundColor: primaryColor }}
      >
        {selectedFiltersCount} selected
      </span>
    )}
  </button>
);

const FilterHeader = ({ selectedFiltersCount, onClearFilters, primaryColor }: FilterHeaderProps) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className={LAYOUT_CLASSES.filterTitle}>Filters</h2>
    {selectedFiltersCount > 0 && (
      <button
        onClick={onClearFilters}
        className={LAYOUT_CLASSES.clearFiltersButton}
        style={{ color: primaryColor }}
      >
        <span>Clear filters</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

const DatasetGrid = ({ datasets, likedItems, onLike, isLoading }: DatasetGridProps) => {
  if (isLoading) {
    return (
      <div className={LAYOUT_CLASSES.datasetGrid}>
        {Array.from({ length: SKELETON_CONFIG.datasetSkeletons }).map((_, index) => (
          <ModelCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (datasets.length === 0) {
    return null;
  }

  return (
    <div className={LAYOUT_CLASSES.datasetGrid}>
      {datasets.map((dataset, index) => (
        <ModelCard
          type="dataset"
          key={index}
          model={dataset}
          isLiked={likedItems[dataset.id || 0]}
          onLike={(id) => onLike(id, dataset.likes || 0)}
        />
      ))}
    </div>
  );
};

const CustomEmptyState = ({ hasFilters }: EmptyStateProps) => (
  <EmptyState
    title={hasFilters ? "No datasets found" : "No datasets available yet"}
    description={hasFilters
      ? "Try adjusting your filters or search terms"
      : "Be the first to contribute a dataset to the marketplace"}
    icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12"
    action={{
      label: "Upload Dataset",
      href: "/dashboard/upload"
    }}
  />
);


export function DatasetsView({ primaryColor = getNetworkColor(), compId }: DatasetsViewProps = {}) {
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { nftData, loader, compNftData } = useAuth();
  const [dataset, setDataset] = useState<any[]>([]);

  useEffect(() => {
    const datasetData = getDatasetData(nftData, compId, compNftData);
    setDataset(datasetData);
  }, [nftData, compId, compNftData]);

  const {
    filteredItems: paginatedDatasets,
    totalItems,
    currentPage,
    totalPages,
    selectedFilters,
    clearFilters,
    setCurrentPage,
    handleFilterSelect
  } = useFilteredItems(dataset);

  const handleLike = (itemId: string, _likes: string) => {
    setLikedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const filteredCategories = useMemo(() => 
    getFilteredCategories(searchQuery), 
    [searchQuery]
  );

  const filteredFormats = useMemo(() => 
    getFilteredFormats(searchQuery), 
    [searchQuery]
  );

  return (
    <div className={LAYOUT_CLASSES.container}>
    
      <MobileFilterDrawer isOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <div className="space-y-6">
          
          <div className="relative">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formats..."
              onClear={() => setSearchQuery('')}
            />
          </div>

          {Object.entries(filteredCategories).map(([category, modalities]) => (
            <FilterSection
              key={category}
              title={category}
              items={modalities}
              categoryIcons={CATEGORY_ICONS}
              selectedFilters={selectedFilters}
              onFilterSelect={handleFilterSelect}
            />
          ))}

          {Object.entries(filteredFormats).map(([category, formats]) => (
            <FilterSection
              key={category}
              title={category}
              items={formats}
              selectedFilters={selectedFilters}
              onFilterSelect={handleFilterSelect}
              isFormatSection={true}
            />
          ))}
        </div>
      </MobileFilterDrawer>

      <div className={LAYOUT_CLASSES.mainContent}>
       
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <MobileFilterButton
            onClick={() => setMobileFiltersOpen(true)}
            selectedFiltersCount={selectedFilters.size}
            primaryColor={primaryColor}
          />
        </div>

        <DatasetGrid
          datasets={paginatedDatasets}
          likedItems={likedItems}
          onLike={handleLike}
          isLoading={loader}
        />

        {!loader && paginatedDatasets.length === 0 && (
          <CustomEmptyState hasFilters={selectedFilters.size > 0} />
        )}

       
        {totalPages > 1 && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            className="mt-8"
          />
        )}
      </div>

      
      <div 
        className={LAYOUT_CLASSES.sidebar} 
        style={{ display: 'none' }}
      >
        {loader ? (
          <>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-20 h-6" />
              </div>
              <Skeleton className="w-full h-12 rounded-lg" />
            </div>
           
            {Array.from({ length: SKELETON_CONFIG.filterCount }).map((_, index) => (
              <div key={index} className={LAYOUT_CLASSES.filterSection}>
                <div className="mb-4">
                  <Skeleton className="w-32 h-6" />
                </div>
                <div className={LAYOUT_CLASSES.filterItems}>
                  {Array.from({ length: SKELETON_CONFIG.skeletonItems }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-10 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="relative">
              <FilterHeader
                selectedFiltersCount={selectedFilters.size}
                onClearFilters={clearFilters}
                primaryColor={primaryColor}
              />
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formats..."
                onClear={() => setSearchQuery('')}
              />
            </div>

            {Object.entries(filteredCategories).map(([category, modalities]) => (
              <FilterSection
                key={category}
                title={category}
                items={modalities}
                categoryIcons={CATEGORY_ICONS}
                selectedFilters={selectedFilters}
                onFilterSelect={handleFilterSelect}
              />
            ))}

            {Object.entries(filteredFormats).map(([category, formats]) => (
              <FilterSection
                key={category}
                title={category}
                items={formats}
                selectedFilters={selectedFilters}
                onFilterSelect={handleFilterSelect}
                isFormatSection={true}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}