import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ModelCard, EmptyState, Pagination, ModelCardSkeleton } from '@/components/ui';
import { useAuth, useFilteredItems } from '@/hooks';

const ITEMS_PER_PAGE = 12;

interface ModelsViewProps {
  compId?: string;
}

export function ModelsView({ compId }: ModelsViewProps = {}) {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const { nftData, loader, compNftData } = useAuth();
  const [modelData, setModelData] = useState([]);

  useEffect(() => {
    if (nftData?.length > 0) {
      const data = compId ? compNftData[compId] : nftData;
      const filtered = data?.filter(item => item?.metadata?.type === "model");
      setModelData(filtered || []);
    }
  }, [nftData, compId, compNftData]);

  const {
    filteredItems: paginatedModels,
    totalItems,
    currentPage,
    totalPages,
    selectedFilters,
    setCurrentPage,
  } = useFilteredItems(modelData, ITEMS_PER_PAGE, categoryFromUrl);

  return (
    <div className="h-[calc(100vh-112px)] pt-6 pb-16 px-4 md:px-6 lg:px-8">
      <div className="h-full overflow-y-auto pb-16 scrollbar-hide">

        {loader ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 lg:px-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <ModelCardSkeleton key={index} />
            ))}
          </div>
        ) : paginatedModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 lg:px-0">
            {paginatedModels.map((model, index) => (
              <ModelCard
                type="model"
                key={index}
                model={model}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={selectedFilters.size > 0 ? "No models found" : "No models available yet"}
            description={selectedFilters.size > 0
              ? "Try adjusting your filters or search terms"
              : "Be the first to add an AI model to the marketplace"}
            icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            action={{
              label: "Add Model",
              onClick: () => {}
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