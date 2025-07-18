import { Skeleton } from './Skeleton';
import { useColors } from '@/hooks';
import { componentStyles } from '@/utils';

interface FilterSkeletonProps {
  itemCount?: number;
}

export function FilterSkeleton({ itemCount = 4 }: FilterSkeletonProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-4">
        <Skeleton className="w-32 h-6" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: itemCount }).map((_, i) => (
          <Skeleton key={i} className="w-full h-10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}