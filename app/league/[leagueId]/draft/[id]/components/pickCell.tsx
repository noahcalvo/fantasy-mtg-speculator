'use client';
import { CardDetails, DraftPick } from '@/app/lib/definitions';
import { routeToCardPageById } from '@/app/lib/routing';
import clsx from 'clsx';
import { PauseCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function PickCell({
  picksTilActive,
  cardData,
  pick,
  cardType,
  paused,
  timeLabel,
  totalSeconds,
}: {
  picksTilActive: number;
  cardData: CardDetails | null;
  pick: DraftPick;
  cardType: string;
  paused?: boolean;
  timeLabel?: string; // e.g., "0:43" or "Paused"
  totalSeconds?: number; // remaining seconds
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const low = (totalSeconds ?? 0) <= 10; // go red in last 10s
  const isActive = picksTilActive == 0;
  return (
    (!pick?.card_id && (
      <td
        className={`capitalize' relative w-24 overflow-auto border-2 border-gray-950 px-1 py-2 text-center text-xs
    ${
      isActive
        ? 'h-40 bg-gray-50 text-gray-950 shadow-inner-shadow'
        : picksTilActive === 1
          ? 'bg-red-900 text-gray-50'
          : picksTilActive === 2
            ? 'bg-orange-900 text-gray-50'
            : picksTilActive === 3
              ? 'bg-yellow-900 text-gray-50'
              : 'bg-gray-950 text-gray-50'
    }`}
        aria-live="polite"
        aria-label={
          isActive
            ? paused
              ? `Draft paused. Time remaining ${timeLabel}`
              : `Time remaining ${timeLabel}`
            : undefined
        }
      >
        <div className="space-y-1">
          <p className="truncate">{isActive ? `Active` : ''}</p>
          {pick ? `${pick.round + 1}.${pick.pick_number + 1}` : ''}
        </div>
        {isActive && paused && (
          <div
            className={clsx(
              'pointer-events-none absolute inset-1 z-20 grid place-items-center',
              // faint diagonal caution stripes, very subtle
              'bg-[repeating-linear-gradient(45deg,rgba(234,179,8,0.10)_0_12px,rgba(234,179,8,0.18)_12px_24px)]',
              'backdrop-blur-[1px]',
            )}
          >
            <div
              className={clsx(
                'absolute right-1 top-1 z-10 rounded px-2 py-0.5 text-xs font-semibold',
                low ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white',
              )}
              title="Time remaining"
            >
              {timeLabel}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-yellow-200/95 px-2 py-0.5 text-xs font-bold text-yellow-900 shadow ring-1 ring-yellow-800/20">
              <PauseCircle className="h-3.5 w-3.5" />
              <span>Paused</span>
            </div>
            {/* pulsing ring to draw eye without being obnoxious */}
            <div className="pointer-events-none absolute inset-0 animate-pulse ring-2 ring-yellow-400" />
          </div>
        )}

        {/* timer pill top-right when active & not paused */}
        {isActive && !paused && (
          <div
            className={clsx(
              'absolute right-1 top-1 z-10 rounded px-2 py-0.5 text-xs font-semibold',
              low ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white',
            )}
            title="Time remaining"
          >
            {timeLabel}
          </div>
        )}
      </td>
    )) || (
      <td
        className="h-40 w-24 cursor-pointer overflow-auto border-4 border-gray-950 bg-gray-50 bg-clip-padding px-1 py-2 text-center text-xs text-gray-950 shadow-inner-shadow hover:underline"
        onClick={() => routeToCardPageById(cardData?.card_id ?? -1)}
      >
        <div className="inline-block hover:no-underline">
          {pick ? pick.round + 1 + '.' + (pick.pick_number + 1) : ''}
        </div>
        <div className="no-scrollbar w-24 overflow-auto font-bold">
          {cardData?.name}
        </div>
        <div className="text-wrap w-24">{cardType}</div>
        {cardData?.image && (
          <div className="relative">
            <Image
              src={cardData?.image[0] ?? ''}
              alt={cardData?.name ?? ''}
              width={200}
              height={100}
              className={`w-full transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-xs font-medium text-gray-600">
                {cardData?.name}
              </div>
            )}
          </div>
        )}
      </td>
    )
  );
}
