'use client';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function MoreAboutStandings() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className="justify-between rounded-xl bg-gray-950 p-2 text-gray-50"
      onClick={() => setShowInfo(!showInfo)}
    >
      <div className="w-full">
        <div className="text-md flex p-2">
          <InformationCircleIcon className="mr-2 h-5 w-5 text-gray-50" />
          Key
        </div>
      </div>
      <div
        className={`inline-block ${showInfo ? 'block' : 'hidden md:inline-block'}`}
      >
        <table className={`inline-block place-content-center  rounded-lg`}>
          <thead className="rounded-lg">
            <tr>
              <th className="rounded-tl-lg px-4 py-2">Icon</th>
              <th className="px-4 py-2">Meaning</th>
            </tr>
          </thead>
          <tbody className="rounded-lg">
            <tr className="rounded-lg">
              <td className="rounded-tl-lg px-4 py-2">
                <span className="font-bold text-lime-600">↑</span>
              </td>
              <td className="px-4 py-2 text-xs">Big points boost</td>
            </tr>
            <tr>
              <td className="px-4 py-2">
                <span className="font-bold text-lime-300">↑</span>
              </td>
              <td className="px-4 py-2 text-xs">Small points boost</td>
            </tr>
            <tr>
              <td className="px-4 py-2">
                <span className="font-bold text-gray-500">--</span>
              </td>
              <td className="px-4 py-2 text-xs">No change</td>
            </tr>
            <tr>
              <td className="px-4 py-2">
                <span className="font-bold text-red-300">↓</span>
              </td>
              <td className="px-4 py-2 text-xs">Small drop</td>
            </tr>
            <tr>
              <td className="px-4 py-2">
                <span className="font-bold text-red-600">↓</span>
              </td>
              <td className="px-4 py-2 text-xs">Big drop</td>
            </tr>
            <tr>
              <td className="rounded-bl-lg px-4 py-2">
                <span className="font-bold text-gray-50">💀</span>
              </td>
              <td className="px-4 py-2 text-xs">Uh oh.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
