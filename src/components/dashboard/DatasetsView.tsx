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


const FORMAT_CATEGORIES: FormatCategories = {
  'File Formats': [
    'json',
    'csv',
    'Miscellaneous'
  ]
};

const LAYOUT_CLASSES = {
  container: 'grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-112px)] pt-6 pb-16 px-4 md:px-6 lg:px-8',
  mainContent: 'lg:col-span-3 h-[calc(100vh-112px)] overflow-y-auto pb-16 scrollbar-hide',
  sidebar: 'space-y-6 h-[calc(100vh-112px)] overflow-y-auto pr-4 -mr-4 pb-16 scrollbar-hide w-[280px]',
  filterSection: 'bg-white rounded-xl shadow-sm border border-[#e1e3e5] p-6',
  filterTitle: 'text-lg font-semibold text-gray-900',
  filterItems: 'space-y-2',
  formatButton: 'w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg transition-all duration-200 flex items-center gap-2 group relative cursor-pointer min-h-[40px]',
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


const getFilteredFormats = (searchQuery: string): FormatCategories => {
  return filterItemsBySearch(FORMAT_CATEGORIES, searchQuery) as unknown as FormatCategories;
};

const getFileFormat = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  if (extension == 'csv') return 'csv';
  if (extension == 'json') return 'json';
  return 'Miscellaneous';
};

const getDatasetData = (nftData: any[], compId?: string, compNftData?: any): any[] => {
  if (!nftData?.length) {
    return [];
  }

  let filteredData = nftData;
  if (compId && compNftData?.[compId]) {
    filteredData = compNftData[compId];
  }

  const datasets = filteredData?.filter((item: any) => item?.metadata?.type === 'dataset') || [];
  
  return datasets.map(dataset => {
    const format = getFileFormat(dataset.nft_file_name || '');
    return {
      ...dataset,
      format,
      categories: [format] // Add categories array for filtering
    };
  });
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
            className={`${LAYOUT_CLASSES.formatButton} ${
              selectedFilters.has(item) 
                ? 'bg-[#0284a5]/5 hover:bg-[#0284a5]/10' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onFilterSelect(item)}
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
            <span className={`${LAYOUT_CLASSES.formatText} ${
              selectedFilters.has(item) ? 'font-semibold text-[#0284a5]' : ''
            }`}>.{item}</span>
            {selectedFilters.has(item) && (
              <button
                className="ml-auto p-1 rounded-full hover:bg-[#0284a5]/20 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterSelect(item);
                }}
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
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