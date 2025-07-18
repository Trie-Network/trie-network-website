import { Skeleton } from './Skeleton';
import { useColors } from '@/hooks';
import { componentStyles } from '@/utils';

export function ModelCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[420px]">
      <Skeleton className="w-full h-[200px]" />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="circular" className="w-6 h-6" />
          <div className="flex-1">
            <Skeleton className="w-3/4 h-4 mb-1" />
            <Skeleton className="w-1/2 h-3" />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-24 h-5" />
        </div>

        <div className="space-y-2 mb-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-12 h-4" />
          </div>
          <Skeleton className="w-24 h-4" />
        </div>
      </div>
    </div>
  );
}