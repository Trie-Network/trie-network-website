import { Skeleton } from './Skeleton';
import { useColors } from '@/hooks';
import { componentStyles } from '@/utils';

export function DetailViewSkeleton() {
  return (
    <div className="min-h-[calc(100vh-112px)] bg-background">
      <div className="bg-white border-b border-slate-200 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="w-64 h-8" />
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="w-32 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-32 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-6" />
            <Skeleton className="w-24 h-6" />
            <Skeleton className="w-24 h-6" />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <Skeleton className="w-20 h-6 rounded-full" />
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <Skeleton className="w-32 h-6 mb-4" />
              <div className="space-y-4">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-5/6 h-4" />
                <Skeleton className="w-4/6 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <Skeleton className="w-full h-48" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <Skeleton className="w-full h-10 rounded-lg mb-3" />
              <Skeleton className="w-full h-10 rounded-lg mb-4" />

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Skeleton className="w-48 h-4 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-32 h-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <Skeleton className="w-32 h-4 mb-4" />
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="w-32 h-4 mb-1" />
                  <Skeleton className="w-24 h-3" />
                </div>
              </div>
              <Skeleton className="w-full h-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}