'use client'
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function MoreAboutScoring() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex flex-col justify-between rounded-xl bg-gray-50 p-2">
      <div className="flex p-2" onClick={() => setShowInfo(!showInfo)}>
        <InformationCircleIcon className="h-5 w-5 text-gray-700" />
        <h3 className="font-xl ml-2">Scoring Info</h3>
      </div>
      <div className='text-center'>
        <table className={`inline-block rounded-lg ${showInfo ? "block" : "hidden md:inline-block"} place-content-center`}>
          <thead className='rounded-lg'>
            <tr>
              <th className="px-4 py-2 rounded-tl-lg">Event</th>
              <th className="px-4 py-2">Points</th>
            </tr>
          </thead>
          <tbody className='rounded-lg'>
            <tr className='rounded-lg'>
              <td className="border px-4 py-2 rounded-tl-lg">Appears in Challenge champion&apos;s deck</td>
              <td className="border px-4 py-2">5 pts</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Appears in Challenge top 8 deck</td>
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
