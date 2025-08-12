'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the actual carousel component
const FeaturesCarouselComponent = dynamic(
  () =>
    import('./features-carousel').then((mod) => ({
      default: mod.FeaturesCarousel,
    })),
  {
    loading: () => (
      <div className="border-3 rounded-xl border-gray-900">
        <div className="aspect-square w-full animate-pulse overflow-hidden rounded-t-lg bg-gray-200">
          <div className="flex h-full items-center justify-center">
            <div className="text-gray-400">Loading features...</div>
          </div>
        </div>
        <div className="w-full rounded-b-lg bg-gray-950 p-4 text-center">
          <span className="text-md font-semibold text-gray-50">Features</span>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for this component to reduce initial bundle
  },
);

export function FeaturesCarouselLazy() {
  return (
    <Suspense
      fallback={
        <div className="border-3 rounded-xl border-gray-900">
          <div className="aspect-square w-full animate-pulse overflow-hidden rounded-t-lg bg-gray-200">
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-400">Loading features...</div>
            </div>
          </div>
          <div className="w-full rounded-b-lg bg-gray-950 p-4 text-center">
            <span className="text-md font-semibold text-gray-50">Features</span>
          </div>
        </div>
      }
    >
      <FeaturesCarouselComponent />
    </Suspense>
  );
}
