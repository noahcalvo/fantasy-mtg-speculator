'use client';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function MoreAboutScoring() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex-col justify-between rounded-xl bg-gray-950 p-2 text-gray-50">
      <div className="flex p-2" onClick={() => setShowInfo(!showInfo)}>
        <InformationCircleIcon className="h-5 w-5" />
        <h3 className="font-xl ml-2">Scoring Info</h3>
      </div>
      <div className="text-center">
        <table
          className={`inline-block rounded-lg ${showInfo ? 'block' : 'hidden md:inline-block'} place-content-center`}
        >
          <thead className="rounded-lg">
            <tr>
              <th className="rounded-tl-lg px-4 py-2">Event</th>
              <th className="px-4 py-2">Points</th>
            </tr>
          </thead>
          <tbody className="rounded-lg">
            <tr className="rounded-lg">
              <td className="rounded-tl-lg border px-4 py-2">
                Appears in Challenge champion&apos;s deck
              </td>
              <td className="border px-4 py-2">5 pts</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">
                Appears in Challenge top 8 deck
              </td>
              <td className="border px-4 py-2">0.5 pts/copy</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Appears in League 5-0 Deck</td>
              <td className="border px-4 py-2">0.25 pts/copy</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
