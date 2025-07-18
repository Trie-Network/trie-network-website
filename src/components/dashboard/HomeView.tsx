import {
  useState
} from 'react';
import {
  EmptyState,
  TrendingItemSkeleton,
  Skeleton
} from '@/components/ui';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { getRelativeTimeString } from '@/utils';
import { motion, useInView, animate } from 'framer-motion';
import { END_POINTS } from '@/api/requests';

interface CounterProps {
  value: number;
  duration?: number;
  label: string;
}

function Counter({ value, duration = 2, label }: CounterProps) {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration,
        onUpdate: (val) => setDisplayValue(Math.round(val)),
        ease: "easeOut"
      });

      return () => controls.stop();
    }
  }, [isInView, value, duration]);

  return (
    <div
      ref={nodeRef}
      className="bg-white p-5 rounded-lg hover:shadow-md transition-all duration-300 border border-slate-200 group text-center"
    >
      <motion.div
        className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors"
      >
        {displayValue}
      </motion.div>
      <div className="text-sm text-gray-500 mt-2">{label}</div>
    </div>
  );
}

export function HomeView() {
  const { nftData, loader, usageHistoryLoader } = useAuth()
  const [modelData, setModalData] = useState([])
  const [datasetData, setDatasetData] = useState([])
  const [ModelMetrics, setModelMetrics] = useState<any>({})
  const [transactions, setTransactions] = useState<any>({})
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      let assets = await END_POINTS.get_asset_count()
      if (assets) {
        setModelMetrics(assets)
      }
      let transactions = await END_POINTS.get_transaction_count()
      if (transactions) {
        setTransactions(transactions)
      }
    })()
  }, [])

  useEffect(() => {
    if (!nftData?.length) {
      return
    }
    setModalData(
      nftData
        ?.filter((data: any) =>
          data?.metadata?.type === "model" &&
          data?.usageHistory &&
          Array.isArray(data.usageHistory) &&
          data.usageHistory.length > 0
        )
        ?.sort((a: any, b: any) => {
          if (!a?.usageHistory?.length || !b?.usageHistory?.length) return 0;
          const aEpoch = a.usageHistory[a.usageHistory.length - 1]?.Epoch;
          const bEpoch = b.usageHistory[b.usageHistory.length - 1]?.Epoch;
          if (aEpoch === undefined || bEpoch === undefined) return 0;
          return bEpoch - aEpoch;
        })
    )
    setDatasetData(
      nftData
        ?.filter((data: any) =>
          data?.metadata?.type === "dataset" &&
          data?.usageHistory &&
          Array.isArray(data.usageHistory) &&
          data.usageHistory.length > 0
        )
        ?.sort((a: any, b: any) => {
          if (!a?.usageHistory?.length || !b?.usageHistory?.length) return 0;
          const aEpoch = a.usageHistory[a.usageHistory.length - 1]?.Epoch;
          const bEpoch = b.usageHistory[b.usageHistory.length - 1]?.Epoch;
          if (aEpoch === undefined || bEpoch === undefined) return 0;
          return bEpoch - aEpoch;
        })
    )
  }, [nftData])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-112px)] pt-6 pb-16 px-4 md:px-6 lg:px-8">
      <div className="lg:col-span-3 h-[calc(100vh-112px)] overflow-y-auto pb-16 scrollbar-hide">
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loader ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <Skeleton className="w-24 h-8 mb-2" />
                  <Skeleton className="w-16 h-4" />
                </div>
              ))
            ) : (
              <>
                <Counter value={ModelMetrics?.ai_model_count || 0} label="AI Models" />
                <Counter value={ModelMetrics?.dataset_count || 0} label="Datasets" />
                <Counter value={ModelMetrics?.asset_count || 0} label="Total Assets" />
                <Counter value={transactions?.transaction_count || 0} label="Transactions" />
              </>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">AI Models</h2>
              <span className="text-sm text-gray-500">(Top 5)</span>
            </div>

            <div className="space-y-3">
              {loader || usageHistoryLoader ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TrendingItemSkeleton key={index} />
                ))
              ) : (
                <>
                  {modelData?.length > 0 ? modelData?.slice(0, 5).map((option: any, index: number) => (
                    <div
                      key={option?.nft || index}
                      onClick={() => navigate(`/dashboard/model/${option?.metadata?.name?.replace(/\s+/g, '-')?.replace(/\//g, '-')}`, { state: { model: { ...option, type: option?.metadata?.type } } })}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                    >
                      <div className={`w-8 h-8 bg-gradient-to-br rounded-lg bg-gray-200 flex text-gray-900 items-center justify-center font-medium`}>
                        {option?.metadata?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {option?.metadata?.name}
                        </h3>
                        <div className="text-xs text-gray-500">
                          {option?.usageHistory?.length > 0 ?
                            <span>Updated {getRelativeTimeString(Number(option?.usageHistory[option?.usageHistory?.length - 1]?.Epoch))}</span> : '-'}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <EmptyState
                      title={"No AI models available yet"}
                      showBackToHome={false}
                      icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12"
                      action={{
                        label: "Upload Model",
                        href: "/dashboard/upload-model"
                      }}
                    />
                  )}

                  {modelData?.length > 5 && (
                    <div className='text-gray-900 flex justify-center'>
                      <button
                        onClick={() => navigate('/dashboard/models')}
                        className='bg-primary font-medium p-2 rounded-lg cursor-pointer text-white w-fit hover:bg-primary-hover transition-colors'
                      >
                        See more models
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Datasets</h2>
              <span className="text-sm text-gray-500">(Top 5)</span>
            </div>

            <div className="space-y-3">
              {loader || usageHistoryLoader ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TrendingItemSkeleton key={index} />
                ))
              ) : (
                <>
                  {datasetData?.length > 0 ? datasetData?.slice(0, 5).map((option: any, index: number) => (
                    <div
                      key={option?.nft || index}
                      onClick={() => navigate(`/dashboard/model/${option?.metadata?.name?.replace(/\s+/g, '-')?.replace(/\//g, '-')}`, { state: { model: { ...option, type: option?.metadata?.type } } })}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                    >
                      <div className={`w-8 h-8 bg-gradient-to-br rounded-lg bg-gray-200 flex text-gray-900 items-center justify-center font-medium`}>
                        {option?.metadata?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {option?.metadata?.name}
                        </h3>
                        <div className="text-xs text-gray-500">
                          {option?.usageHistory?.length > 0 ?
                            <span>Updated {getRelativeTimeString(Number(option?.usageHistory[option?.usageHistory?.length - 1]?.Epoch))}</span> : '-'}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <EmptyState
                      title={"No datasets available yet"}
                      icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12"
                      showBackToHome={false}
                      action={{
                        label: "Upload Dataset",
                        href: "/dashboard/upload-dataset"
                      }}
                    />
                  )}

                  {datasetData?.length > 5 && (
                    <div className='text-gray-900 flex justify-center'>
                      <button
                        onClick={() => navigate('/dashboard/datasets')}
                        className='bg-primary font-medium p-2 rounded-lg cursor-pointer text-white w-fit hover:bg-primary-hover transition-colors'
                      >
                        See more datasets
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}