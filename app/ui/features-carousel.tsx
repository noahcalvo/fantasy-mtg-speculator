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
export function FeaturesCarousel() {
  const [currentFeature, setCurrentFeature] = useState<FeatureKey>('draft');

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-gray-50 px-6 py-4 sm:px-20 md:w-1/3 md:px-6 lg:px-12 xl:px-16">
      <div>
        <p
          className={`w-full text-xl text-gray-800 md:text-3xl md:leading-normal`}
        >
          <strong>Spec Features</strong>
        </p>
        <div>
          <div className="grid list-none grid-cols-2 gap-4 text-gray-600">
            <ul className="list-inside">
              <li
                className="my-1 rounded-md border border-gray-600 px-1"
                onClick={() => setCurrentFeature('draft')}
              >
                Draft by set
              </li>
              <li
                className="my-1 rounded-md border border-gray-600 px-1"
                onClick={() => setCurrentFeature('lineup')}
              >
                Manage your lineup
              </li>
              <li
                className="my-1 rounded-md border border-gray-600 px-1"
                onClick={() => setCurrentFeature('standings')}
              >
                League standings
              </li>
            </ul>
            <ul className="list-inside">
              <li
                className="my-1 rounded-md border border-gray-600 px-1"
                onClick={() => setCurrentFeature('chat')}
              >
                League chat
              </li>
              <li
                className="my-1 rounded-md border border-gray-600 px-1"
                onClick={() => setCurrentFeature('trade')}
              >
                Trade
              </li>
              <li
                className="my-1 rounded-md border border-gray-600 px-1"
                onClick={() => setCurrentFeature('performance')}
              >
                View card performance
              </li>
            </ul>
          </div>
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
