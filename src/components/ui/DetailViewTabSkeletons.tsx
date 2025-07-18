import { Skeleton } from './Skeleton';
import { useColors } from '@/hooks';
import { componentStyles } from '@/utils';

export function OverviewSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <Skeleton className="w-32 h-6 mb-4" />
      <div className="space-y-4">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-5/6 h-4" />
        <Skeleton className="w-4/6 h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
      </div>
    </div>
  );
}

export function FilesSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <Skeleton className="w-32 h-6" />
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="w-32 h-4 mb-1" />
                <Skeleton className="w-48 h-3" />
              </div>
            </div>
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UsageGuideSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Skeleton className="w-32 h-6 mb-4" />
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Skeleton className="w-32 h-6 mb-4" />
        <Skeleton className="w-full h-24 rounded-lg" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Skeleton className="w-32 h-6 mb-6" />
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="w-48 h-5 mb-2" />
              <Skeleton className="w-full h-4 mb-3" />
              <Skeleton className="w-full h-12 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <Skeleton className="w-48 h-6 mb-6" />
      <div className="grid grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <Skeleton className="w-24 h-4 mb-1" />
            <Skeleton className="w-16 h-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiscussionsSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="text-center py-8">
        <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
        <Skeleton className="w-48 h-6 mx-auto mb-2" />
        <Skeleton className="w-64 h-4 mx-auto mb-4" />
        <Skeleton className="w-32 h-10 rounded-lg mx-auto" />
      </div>
    </div>
  );
}