'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

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
  trade: { desktop: '/trade.desktop.png', mobile: '/trade.png' },
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

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
      {/* Images for desktop and mobile */}
      <Image
        src={pictureFeatureMap[currentKey].desktop}
        alt={currentKey}
        fill
        className="hidden object-cover md:block"
      />
      <Image
        src={pictureFeatureMap[currentKey].mobile}
        alt={currentKey}
        fill
        className="block object-cover md:hidden"
      />

      {/* Transparent banner */}
      <div className="absolute bottom-0 w-full bg-red-900 bg-opacity-70 p-4 text-center">
        <span className="text-lg font-semibold text-gray-50">{bannerText}</span>
      </div>

      {/* Click zones */}
      <div
        className="absolute inset-0 flex"
        onClick={(e) => {
          const { left, width } = (
            e.currentTarget as HTMLDivElement
          ).getBoundingClientRect();
          const clickX = e.clientX - left;
          if (clickX < width / 2) goPrev();
          else goNext();
        }}
      >
        <div className="flex-1" />
        <div className="flex-1" />
      </div>
    </div>
  );
}
