'use client';
import { ScoringOption } from '@/app/lib/definitions';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function MoreAboutScoring({
  scoringInfo,
}: {
  scoringInfo: ScoringOption[];
}) {
  const [showInfo, setShowInfo] = useState(false);

  // sort scoring info by most points, and the by format
  scoringInfo.sort((a, b) => {
    if (a.points === b.points) {
      return a.format.localeCompare(b.format);
    }
    return b.points - a.points;
  });

  return (
    <div className="flex-col justify-between rounded-xl bg-gray-950 p-2 text-gray-50">
      <div className="flex p-2" onClick={() => setShowInfo(!showInfo)}>
        <InformationCircleIcon className="h-5 w-5" />
        <h3 className="text-md ml-2">Scoring Events</h3>
      </div>
      <div className="text-center">
        <table
          className={`inline-block rounded-lg ${showInfo ? 'block' : 'hidden md:inline-block'} place-content-center`}
        >
          <tbody className="rounded-lg text-sm">
            {scoringInfo.map((info, index) => (
              <tr key={index} className="rounded-lg">
                <td className="border px-4 py-2">
                  {info.format} {info.tournament_type}
                </td>
                <td className="border px-4 py-2">
                  {info.points} pts
                  {info.is_per_copy && ' per copy'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
