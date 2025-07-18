import { useState, useMemo } from 'react';
import { ModelCard, SearchInput, EmptyState, FilterButton, Pagination, MobileFilterDrawer, ModelCardSkeleton, FilterSkeleton, Skeleton } from '@/components/ui';
import { useAuth, useFilteredItems , useColors } from '@/hooks';
import { componentStyles } from '@/utils';

const ITEMS_PER_PAGE = 12;

const PROVIDER_ICONS = {
  'GPU': {
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500'
  },
  'CPU': {
    icon: 'M8 16a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2m-6 0a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2M8 8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2m-6 0a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2m-3 6h2m-2-4h2M8 12h8',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  },
  'TPU': {
    icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25',
    color: 'bg-gradient-to-br from-green-500 to-emerald-500'
  },
  'Memory': {
    icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
    color: 'bg-gradient-to-br from-orange-500 to-red-500'
  },
  'Storage': {
    icon: 'M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776',
    color: 'bg-gradient-to-br from-indigo-500 to-purple-500'
  }
};

const HARDWARE_TYPES = {
  'Compute': [
    'GPU',
    'CPU',
    'TPU'
  ],
  'Infrastructure': [
    'Memory',
    'Storage'
  ]
};

const REGIONS = {
  'North America': [
    'US East (N. Virginia)',
    'US West (Oregon)',
    'Canada (Central)'
  ],
  'Europe': [
    'Ireland',
    'Frankfurt',
    'London'
  ],
  'Asia Pacific': [
    'Tokyo',
    'Singapore',
    'Sydney'
  ]
};

export function InfraProvidersView() {

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { infraProviders, loader } = useAuth()

  const {
    filteredItems: paginatedProviders,
    totalItems,
    currentPage,
    totalPages,
    selectedFilters,
    clearFilters,
    setCurrentPage,
    handleFilterSelect
  } = useFilteredItems(infraProviders);

  const filteredHardwareTypes = useMemo(() => {
    if (!searchQuery) return HARDWARE_TYPES;

    const query = searchQuery.toLowerCase();
    const filtered: typeof HARDWARE_TYPES = {
      'Compute': [],
      'Infrastructure': []
    };

    Object.entries(HARDWARE_TYPES).forEach(([category, types]) => {
      const matchingTypes = types.filter(type =>
        type.toLowerCase().includes(query)
      );

      filtered[category as keyof typeof HARDWARE_TYPES] = matchingTypes;
    });

    return filtered;
  }, [searchQuery]);

  const filteredRegions = useMemo(() => {
    if (!searchQuery) return REGIONS;

    const query = searchQuery.toLowerCase();
    const filtered: typeof REGIONS = {
      'North America': [],
      'Europe': [],
      'Asia Pacific': []
    };

    Object.entries(REGIONS).forEach(([region, locations]) => {
      const matchingLocations = locations.filter(location =>
        location.toLowerCase().includes(query)
      );

      filtered[region as keyof typeof REGIONS] = matchingLocations;
    });

    return filtered;
  }, [searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-112px)] pt-6 pb-16 px-4 md:px-6 lg:px-8">
      <MobileFilterDrawer isOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <div className="space-y-6">
            <div className="relative">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hardware..."
              onClear={() => setSearchQuery('')}
            />
          </div>

          {Object.entries(filteredHardwareTypes).map(([category, types]) => (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
              </div>
              <div className="space-y-2">
                {types.map((type) => (
                  <FilterButton
                    key={type}
                    label={type}
                    icon={PROVIDER_ICONS[type as keyof typeof PROVIDER_ICONS].icon}
                    color={PROVIDER_ICONS[type as keyof typeof PROVIDER_ICONS].color}
                    isSelected={selectedFilters.has(type)}
                    onSelect={() => handleFilterSelect(type)}
                    onRemove={() => handleFilterSelect(type)}
                  />
                ))}
              </div>
            </div>
          ))}

          {Object.entries(filteredRegions).map(([region, locations]) => (
            <div key={region} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{region}</h2>
              </div>
              <div className="space-y-2">
                {locations.map((location) => (
                  <button
                    key={location}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <div className="w-5 h-5 bg-gradient-to-br from-gray-500 to-gray-600 rounded flex items-center justify-center text-white">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    </div>
                    <span>{location}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </MobileFilterDrawer>

      <div className="lg:col-span-3 h-[calc(100vh-112px)] overflow-y-auto pb-16 scrollbar-hide">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          {selectedFilters.size > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
              {selectedFilters.size} selected
            </span>
          )}
        </div>

        {loader ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ModelCardSkeleton key={index} />
            ))}
          </div>
        ) : paginatedProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedProviders.map((provider: any, index) => (
              <ModelCard
                type="infra"
                key={index}
                model={{
                  metadata: {
                    ...provider,
                    name: provider?.name,
                    description: provider?.description,
                  },
                  likes: provider.likes
                }}
                isLiked={false}
                onLike={() => { }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={selectedFilters.size > 0 ? "No providers found" : "No infrastructure providers available yet"}
            description={selectedFilters.size > 0
              ? "Try adjusting your filters or search terms"
              : "Be the first to register as an infrastructure provider"}
            icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            action={{
              label: "Become a Provider",
              onClick: () => {}
            }}
          />
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

      <div className="space-y-6 h-[calc(100vh-112px)] overflow-y-auto pr-4 -mr-4 pb-16 scrollbar-hide w-[280px]">
        {loader ? (
          <>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-20 h-6" />
              </div>
              <Skeleton className="w-full h-12 rounded-lg" />
            </div>
            <FilterSkeleton itemCount={3} />
            <FilterSkeleton itemCount={2} />
            <FilterSkeleton itemCount={3} />
          </>
        ) : (
          <>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {selectedFilters.size > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    <span>Clear filters</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hardware..."
                onClear={() => setSearchQuery('')}
              />
            </div>

            {Object.entries(filteredHardwareTypes).map(([category, types]) => (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                </div>
                <div className="space-y-2">
                  {types.map((type) => (
                    <FilterButton
                      key={type}
                      label={type}
                      icon={PROVIDER_ICONS[type as keyof typeof PROVIDER_ICONS].icon}
                      color={PROVIDER_ICONS[type as keyof typeof PROVIDER_ICONS].color}
                      isSelected={selectedFilters.has(type)}
                      onSelect={() => handleFilterSelect(type)}
                      onRemove={() => handleFilterSelect(type)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {Object.entries(filteredRegions).map(([region, locations]) => (
              <div key={region} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{region}</h2>
                </div>
                <div className="space-y-2">
                  {locations.map((location) => (
                    <button
                      key={location}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <div className="w-5 h-5 bg-gradient-to-br from-gray-500 to-gray-600 rounded flex items-center justify-center text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                      </div>
                      <span>{location}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}