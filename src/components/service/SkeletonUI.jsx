import React from 'react';

/**
 * 스켈레톤 UI 컴포넌트들
 * 데이터 로딩 중 표시 - 라이트 그레이 펄스 애니메이션
 */

function SkeletonBlock({ className = '' }) {
  return (
    <div className={`bg-neutral-200 rounded-xl animate-pulse ${className}`} />
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full bg-neutral-100 p-4">
      <SkeletonBlock className="w-full aspect-[4/3] rounded-2xl" />
      <div className="flex items-center justify-center gap-2 py-4">
        <SkeletonBlock className="w-6 h-2 rounded-full" />
        <SkeletonBlock className="w-2 h-2 rounded-full" />
        <SkeletonBlock className="w-2 h-2 rounded-full" />
      </div>
    </div>
  );
}

export function GuideSkeleton() {
  return (
    <div className="px-5 py-6">
      <SkeletonBlock className="w-40 h-5 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-20 rounded-2xl" />
        <SkeletonBlock className="h-20 rounded-2xl" />
      </div>
    </div>
  );
}

export function SegmentSkeleton() {
  return (
    <div className="px-5 py-4 flex justify-center gap-3">
      <SkeletonBlock className="w-32 h-10 rounded-full" />
      <SkeletonBlock className="w-28 h-10 rounded-full" />
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="px-5 pb-6">
      <div className="bg-neutral-50 rounded-3xl p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <SkeletonBlock className="w-8 h-8 rounded-lg" />
          <SkeletonBlock className="w-28 h-4" />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-16 rounded-2xl" />
          <SkeletonBlock className="h-16 rounded-2xl" />
          <SkeletonBlock className="h-16 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function BlogListSkeleton() {
  return (
    <div className="px-5 pb-6">
      <SkeletonBlock className="w-16 h-4 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <SkeletonBlock className="w-[72px] h-[72px] rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="w-20 h-3" />
              <SkeletonBlock className="w-full h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="sticky top-0 z-50 bg-white">
      <div className="px-5 pt-4 pb-2">
        <SkeletonBlock className="w-28 h-6" />
      </div>
      <div className="flex gap-5 px-5 pb-3">
        <SkeletonBlock className="w-16 h-4" />
        <SkeletonBlock className="w-12 h-4" />
        <SkeletonBlock className="w-16 h-4" />
        <SkeletonBlock className="w-16 h-4" />
      </div>
      <div className="h-[1px] bg-neutral-100" />
    </div>
  );
}
