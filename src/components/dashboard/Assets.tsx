import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EmptyState, Skeleton } from '@/components/ui';
import { END_POINTS } from '@/api/requests';
import { useAuth , useColors } from '@/hooks';
import { getRelativeTimeString , componentStyles } from '@/utils';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 4;

export function Assets({ primaryColor = '#0284a5', compId = null as any }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { nftData } = useAuth()
  const [assets, setAssests] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      let data = localStorage.getItem("wallet_details") as any
      data = data ? JSON.parse(data) : null
      if (!data) {
        return
      }
      let result = await END_POINTS.get_nfts_by_did({ did: data?.did }) as any
      if (!result?.status) {
        return
      }
      if (!compId) {
        result = result?.nfts?.map((item: any) => nftData?.find((itm: any) => itm.nft === item?.nft))
        if (!result?.length) {
          return
        }
      } else {
        result = result?.nfts?.map(item => ({
          ...item, metadata: JSON.parse(item?.nft_metadata || '{}')
        })).filter((item: any) => item?.metadata?.compId === compId)
      }
      setAssests(result)
    })()
  }, [])

  const totalPages = Math.ceil(assets?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAssets = assets.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (model: any) => {
    let slug = model?.metadata?.name as any
    slug = slug.replace(/\s+/g, '-');
    let modelType = model?.metadata?.type || "assets";

    navigate(`/dashboard/${modelType}/${slug}`, {
      state: { model: { ...model, type: modelType } }
    });
  };

  if (paginatedAssets.length === 0) {
    return (
      <EmptyState
        title="No purchases yet"
        description="Start exploring the marketplace to find AI models, datasets, and infrastructure services."
        icon="M3 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        action={{
          label: 'Browse Marketplace',
          href: '/dashboard/all'
        }}
      />
    );
  }
  return (
    <div className="min-h-[calc(100vh-112px)] h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 mx-4 md:mx-6 lg:mx-8 mt-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            {isLoading ? (
              <div>
                <Skeleton className="w-48 h-8 mb-2" />
                <Skeleton className="w-96 h-4" />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Assets</h1>
                {

}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <Skeleton className="w-16 h-8 mb-1" />
                  <Skeleton className="w-24 h-4" />
                </div>
                <div className="text-center">
                  <Skeleton className="w-16 h-8 mb-1" />
                  <Skeleton className="w-24 h-4" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{assets?.length}</div>
                  <div className="text-sm text-gray-500">Total Assets</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-6 lg:px-8 mb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex flex-col gap-4">
                  <div className="w-full h-48 sm:h-32 rounded-lg overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>

                  <div>
                    <Skeleton className="w-48 h-6 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="w-24 h-6 rounded-full" />
                      <Skeleton className="w-32 h-6 rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-32 h-4" />
                  </div>

                  <div>
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            paginatedAssets?.map((asset: any, index: number) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={() => handleCardClick(asset)}
                className="group bg-white rounded-xl border border-slate-200 hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer min-h-[300px] relative"
              >
                <div className="relative h-[225px] overflow-hidden bg-gray-50 flex-shrink-0 group-hover:after:absolute group-hover:after:inset-0 group-hover:after:bg-black/10 group-hover:after:transition-opacity">
                  <img
                    src={'/modelph.png'}
                    alt={asset?.metadata?.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                        <div className="p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium shadow-sm flex-shrink-0">
                        {asset?.metadata?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 leading-snug tracking-tight truncate font-display">
                          {asset?.metadata?.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate font-mono">
                          {asset?.serviceName?.split('/')[0]}
                        </p>
                      </div>
                    </div>

                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {asset?.metadata?.description}
                    </p>

                    <span className="text-xs text-gray-500">
                      {asset?.usageHistory?.length > 0 ? `Updated ${getRelativeTimeString(asset?.usageHistory[asset?.usageHistory?.length - 1]?.Epoch)}` : null}
                    </span>
                  </div>

                </div>
              </motion.div>
            ))
          )}
        </div>
        {!paginatedAssets?.length ?
          <EmptyState
            title={"No Assets Available"}
            description='Please upload models/datasets'

            icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12"
            showBackToHome={false}
            action={{
              label: "Upload Dataset",
              href: "/dashboard/upload-dataset"
            }}
          /> : null}
        {assets.length > ITEMS_PER_PAGE
          &&
          <div className="mt-8 flex items-center justify-between bg-white rounded-xl border border-slate-200 px-6 py-4 shadow-sm">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, assets?.length)}
                  </span>{' '}
                  of <span className="font-medium">{assets?.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                        ? 'z-10 bg-primary border-primary text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>}
      </div>
    </div>
  );
}