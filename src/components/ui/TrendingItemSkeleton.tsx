import { Skeleton } from './Skeleton';
import { useColors } from '@/hooks';
import { componentStyles } from '@/utils';

export function TrendingItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-white rounded-lg border border-slate-200">
      <div className="flex items-center gap-3 w-full">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1 min-w-0">
          <Skeleton className="w-48 h-4 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="w-32 h-3" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600 w-full sm:w-auto justify-between mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-16 h-8 rounded-full" />
      </div>
    </div>
  );
}