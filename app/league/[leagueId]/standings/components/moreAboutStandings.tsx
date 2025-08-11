'use client';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

// Define the shape of each key item
interface KeyItem {
  symbol: string;
  colorClass: string;
  description: string;
  rounded?: 'tl' | 'bl';
}

interface MoreAboutStandingsProps {
  keyItems?: KeyItem[];
}

// Default configuration for the standings key
const defaultKeyItems: KeyItem[] = [
  {
    symbol: '↑',
    colorClass: 'text-lime-600',
    description: 'Big points boost',
  },
  {
    symbol: '↑',
    colorClass: 'text-lime-300',
    description: 'Small points boost',
  },
  { symbol: '--', colorClass: 'text-gray-500', description: 'No change' },
  { symbol: '↓', colorClass: 'text-red-300', description: 'Small drop' },
  { symbol: '↓', colorClass: 'text-red-600', description: 'Big drop' },
  {
    symbol: '💀',
    colorClass: 'text-gray-50',
    description: 'Uh oh.',
    rounded: 'bl',
  },
];

export default function MoreAboutStandings({
  keyItems = defaultKeyItems,
}: MoreAboutStandingsProps) {
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const getFirstCellClasses = (item: KeyItem): string => {
    if (item.rounded === 'tl') return 'rounded-tl-lg';
    if (item.rounded === 'bl') return 'rounded-bl-lg';
    return '';
  };

  return (
    <div
      className="rounded-xl bg-gray-950 p-2 text-gray-50"
      onClick={() => setShowInfo((prev) => !prev)}
    >
      <div className="flex p-2 text-md">
        <InformationCircleIcon className="mr-2 h-5 w-5 text-gray-50" />
        Key
      </div>
      {!showInfo && (
        <p className="w-full text-center text-sm font-normal lg:hidden">
          Tap to open
        </p>
      )}
      <div
        className={`inline-block ${showInfo ? '' : 'h-0 lg:h-full'} overflow-hidden text-md`}
      >
        <table className="inline-block place-content-center rounded-lg">
          <div className="h-1 w-full bg-gray-800" />
          <tbody className="rounded-lg">
            {keyItems.map((item: KeyItem, idx: number) => (
              <tr key={idx} className="rounded-lg">
                <td className={`${getFirstCellClasses(item)} px-4 py-2`}>
                  <span className={`font-bold ${item.colorClass}`}>
                    {item.symbol}
                  </span>
                </td>
                <td className="px-4 py-2">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
