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
  low,
  showCard,
}: {
  picksTilActive: number;
  cardData: CardDetails | null;
  pick: DraftPick;
  cardType: string[];
  paused?: boolean;
  timeLabel?: string; // e.g., "0:43" or "Paused"
  low: boolean; // true if less than 30 seconds remaining
  showCard: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
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
        onClick={() => routeToCardPageById(cardData?.card_id ?? -1)}
        className={clsx(
          'max-w-24 cursor-pointer border-4 border-gray-950 bg-gray-50 px-1 py-2 text-center align-top text-xs text-gray-950 shadow-inner-shadow',
          cardData?.image && showCard && 'h-30 bg-cover bg-center bg-no-repeat',
        )}
        style={{
          backgroundImage:
            cardData?.image && showCard
              ? `url(${cardData.image[0]})`
              : undefined,
        }}
      >
        <div className="max-w-24 relative top-2 z-10 flex flex-wrap items-start justify-between gap-1 px-1 text-gray-950">
          <div className="rounded-sm border border-gray-950 bg-gray-50 px-1.5">
            {pick ? `${pick.round + 1}.${pick.pick_number + 1}` : ''}
          </div>

          {cardType.map((type, i) => {
            const color =
              abbrevColors[type] ?? 'bg-gray-100 border-gray-400 text-gray-800';
            return (
              <div
                key={i}
                className={clsx(
                  'rounded-sm border px-1.5 text-[0.7rem] font-semibold shadow-sm',
                  color,
                )}
              >
                {type}
              </div>
            );
          })}
        </div>
      </td>
    )
  );
}

const abbrevColors: Record<string, string> = {
  Cre: 'bg-lime-300 border-lime-700 text-lime-950', // Creature → earthy green
  'Ins/Sor': 'bg-sky-200 border-sky-500 text-sky-950', // Instant/Sorcery → light blue
  'Art/Enc': 'bg-amber-200 border-amber-500 text-amber-950', // Artifact/Enchantment → warm orange
  Land: 'bg-lime-200 border-lime-600 text-lime-950', // Land → yellow-green
  Flex: 'bg-gray-200 border-gray-500 text-gray-800', // Flex → neutral gray
};
