'use client';
import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';

type FeatureKey =
  | 'draft'
  | 'lineup'
  | 'standings'
  | 'chat'
  | 'trade'
  | 'performance';

const pictureFeatureMap: Record<
  FeatureKey,
  { desktop: string; mobile: string }
> = {
  draft: { desktop: '/draft.desktop.png', mobile: '/draft.mobile.png' },
  lineup: { desktop: '/roster.desktop.png', mobile: '/roster.mobile.png' },
  standings: {
    desktop: '/standings.desktop.png',
    mobile: '/standings.mobile.png',
  },
  chat: { desktop: '/chat.png', mobile: '/chat.png' },
  trade: { desktop: '/trade.desktop.png', mobile: '/trade.mobile.png' },
  performance: { desktop: '/performance.png', mobile: '/performance.png' },
};

const featureLabels: Record<FeatureKey, string> = {
  draft: 'Draft by set',
  lineup: 'Manage your lineup',
  standings: 'League standings',
  chat: 'Chat with your league',
  trade: 'Trade',
  performance: 'Track card performance',
};

export function FeaturesCarousel() {
  const featureKeys = Object.keys(pictureFeatureMap) as FeatureKey[];
  const [currentFeatureIdx, setCurrentFeatureIdx] = useState(0);
  const timerRef = useRef<number>();
  const intervalMs = 5000; // switch every 5 seconds

  // Auto-advance
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setCurrentFeatureIdx((idx) => (idx + 1) % featureKeys.length);
    }, intervalMs);
    return () => window.clearInterval(timerRef.current);
  }, [featureKeys.length]);

  const goPrev = () => {
    setCurrentFeatureIdx(
      (idx) => (idx - 1 + featureKeys.length) % featureKeys.length,
    );
    resetTimer();
  };
  const goNext = () => {
    setCurrentFeatureIdx((idx) => (idx + 1) % featureKeys.length);
    resetTimer();
  };
  const resetTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      setCurrentFeatureIdx((idx) => (idx + 1) % featureKeys.length);
    }, intervalMs);
  };

  const currentKey = featureKeys[currentFeatureIdx];
  const bannerText = featureLabels[currentKey];

  // Memoize the image sources to avoid recalculation
  const currentImages = useMemo(
    () => pictureFeatureMap[currentKey],
    [currentKey],
  );

  return (
    <div className="border-3 rounded-xl border-gray-900">
      <div className="group relative aspect-square w-full overflow-hidden rounded-t-lg">
        {/* Images for desktop and mobile */}
        <Image
          src={currentImages.desktop}
          alt={currentKey}
          fill
          className="hidden object-cover md:block"
          priority={currentFeatureIdx === 0} // Only prioritize the first image
        />
        <Image
          src={currentImages.mobile}
          alt={currentKey}
          fill
          className="block object-cover md:hidden"
          priority={currentFeatureIdx === 0} // Only prioritize the first image
        />
        {/* Navigation arrows */}
        <div className="pointer-events-none absolute inset-0 flex">
          {/* Left arrow */}
          <div className="flex flex-1 items-center justify-start pl-4">
            <button
              className="pointer-events-auto rounded-full bg-gray-950 bg-opacity-0 bg-opacity-50 p-3 opacity-100"
              onClick={goPrev}
            >
              <svg
                className="h-6 w-6 text-gray-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
          {/* Right arrow */}
          <div className="flex flex-1 items-center justify-end pr-4">
            <button
              className="pointer-events-auto rounded-full bg-gray-950 bg-opacity-0 bg-opacity-50 p-3 opacity-100"
              onClick={goNext}
            >
              <svg
                className="h-6 w-6 text-gray-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
          {featureKeys.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentFeatureIdx(idx);
                resetTimer();
              }}
              className={`border-1 h-3 w-3 rounded-full border-gray-950 ${
                idx === currentFeatureIdx
                  ? 'bg-red-900'
                  : 'bg-gray-50/70 hover:bg-opacity-90'
              }`}
            />
          ))}
        </div>
      </div>
      {/* Transparent banner */}
      <div className="w-full rounded-b-lg bg-gray-950 p-4 text-center">
        <span className="text-md font-semibold text-gray-50">{bannerText}</span>
      </div>
    </div>
  );
}
