'use client';

import Image from 'next/image';
import { useState } from 'react';

const pictureFeatureMap: {
  [key in FeatureKey]: { desktop: string; mobile: string };
} = {
  draft: { desktop: '/draft.desktop.png', mobile: '/draft.mobile.png' },
  lineup: { desktop: '/roster.desktop.png', mobile: '/roster.mobile.png' },
  standings: {
    desktop: '/standings.desktop.png',
    mobile: '/standings.mobile.png',
  },
  chat: {
    desktop: '/chat.png',
    mobile: '/chat.png',
  },
  trade: { desktop: '/trade.desktop.png', mobile: '/trade.mobile.png' },
  performance: {
    desktop: '/performance.png',
    mobile: '/performance.png',
  },
};

type FeatureKey =
  | 'draft'
  | 'lineup'
  | 'standings'
  | 'chat'
  | 'trade'
  | 'performance';

type FeatureButtonProps = {
  featureKey: FeatureKey;
  currentFeature: FeatureKey;
  onClick: (feature: FeatureKey) => void;
  children: React.ReactNode;
};

function FeatureButton({
  featureKey,
  currentFeature,
  onClick,
  children,
}: FeatureButtonProps) {
  return (
    <li
      className={`my-2 cursor-pointer rounded-md border border-gray-600 px-1 ${
        currentFeature === featureKey ? 'bg-gray-950 text-gray-50' : ''
      }`}
      onClick={() => onClick(featureKey)}
    >
      {children}
    </li>
  );
}

export function FeaturesCarousel() {
  const [currentFeature, setCurrentFeature] = useState<FeatureKey>('draft');

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-gray-50 px-8 py-8 font-mono xl:w-1/3">
      <p className="mb-4 w-full text-lg text-gray-800">Spec Features:</p>
      <div>
        <div className="grid list-none grid-cols-2 gap-4 text-gray-600">
          <ul className="list-inside">
            <FeatureButton
              featureKey="draft"
              currentFeature={currentFeature}
              onClick={setCurrentFeature}
            >
              Draft by set
            </FeatureButton>
            <FeatureButton
              featureKey="lineup"
              currentFeature={currentFeature}
              onClick={setCurrentFeature}
            >
              Manage your lineup
            </FeatureButton>
            <FeatureButton
              featureKey="standings"
              currentFeature={currentFeature}
              onClick={setCurrentFeature}
            >
              League standings
            </FeatureButton>
          </ul>
          <ul className="list-inside">
            <FeatureButton
              featureKey="chat"
              currentFeature={currentFeature}
              onClick={setCurrentFeature}
            >
              Chat with your league
            </FeatureButton>
            <FeatureButton
              featureKey="trade"
              currentFeature={currentFeature}
              onClick={setCurrentFeature}
            >
              Trade
            </FeatureButton>
            <FeatureButton
              featureKey="performance"
              currentFeature={currentFeature}
              onClick={setCurrentFeature}
            >
              Track card performance
            </FeatureButton>
          </ul>
        </div>
      </div>
      <div className="aspect-square w-full overflow-hidden">
        <Image
          src={
            pictureFeatureMap[currentFeature].desktop?.toString() ??
            '/draft.desktop.png'
          }
          width="400"
          height="400"
          alt={'image of ' + currentFeature}
          className="hidden w-full border-2 border-black md:block"
        />
        <Image
          src={
            pictureFeatureMap[currentFeature].mobile?.toString() ??
            '/draft.desktop.png'
          }
          width="200"
          height="200"
          alt={'image of ' + currentFeature}
          className="block aspect-square w-full border-2 border-black md:hidden"
        />
      </div>
    </div>
  );
}
