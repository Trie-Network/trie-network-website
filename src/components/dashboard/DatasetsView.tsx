import { useState, useEffect } from 'react';
import { ModelCard, EmptyState, Pagination, ModelCardSkeleton } from '@/components/ui';
import { useAuth, useFilteredItems } from '@/hooks';

const ITEMS_PER_PAGE = 12;

interface DatasetsViewProps {
  compId?: string;
}

export function DatasetsView({ compId }: DatasetsViewProps = {}) {
  const { nftData, loader, compNftData } = useAuth();
  const [dataset, setDataset] = useState([]);
  
  useEffect(() => {
    if (!nftData?.length) return;
    
    const data = compId ? compNftData[compId] : nftData;
    const filtered = data?.filter(item => item?.metadata?.type === 'dataset');
    setDataset(filtered || []);
  }, [nftData, compId, compNftData]);

  const {
    filteredItems: paginatedDatasets,
    totalItems,
    currentPage,
    totalPages,
    selectedFilters,
    setCurrentPage,
  } = useFilteredItems(dataset, ITEMS_PER_PAGE);

  return (
    <div className="h-[calc(100vh-112px)] pt-6 pb-16 px-4 md:px-6 lg:px-8">
      <div className="h-full overflow-y-auto pb-16 scrollbar-hide">

        {loader ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ModelCardSkeleton key={index} />
            ))}
          </div>
        ) : paginatedDatasets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paginatedDatasets.map((dataset, index) => (
              <ModelCard
                type="dataset"
                key={index}
                model={dataset}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={selectedFilters.size > 0 ? "No datasets found" : "No datasets available yet"}
            description={selectedFilters.size > 0
              ? "Try adjusting your filters or search terms"
              : "Be the first to contribute a dataset to the marketplace"}
            icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12"
            action={{
              label: "Upload Dataset",
              href: "/dashboard/upload"
            }}
          />
        )}

        {totalPages > 1 && (
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
    </div>
  );
}