'use client'
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function MoreAboutStandings() {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="justify-between rounded-xl bg-black text-white p-2" onClick={() => setShowInfo(!showInfo)}>
            <div className='w-full'>
                <div className="p-2 font-xl flex">
                    <InformationCircleIcon className="h-5 w-5 text-white mr-2" />Icon Info
                </div>
            </div>
            <div className={`inline-block ${showInfo ? "block" : "hidden md:inline-block"}`}>
                <table className={`inline-block rounded-lg  place-content-center`}>
                    <thead className='rounded-lg'>
                        <tr>
                            <th className="px-4 py-2 rounded-tl-lg">Icon</th>
                            <th className="px-4 py-2">Meaning</th>
                        </tr>
                    </thead>
                    <tbody className='rounded-lg'>
                        <tr className='rounded-lg'>
                            <td className="px-4 py-2 rounded-tl-lg"><span className="text-lime-600 font-bold">↑</span></td>
                            <td className="px-4 py-2 text-xs">Significant increase in player&apos;s portion of points</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2"><span className="text-lime-300 font-bold">↑</span></td>
                            <td className="px-4 py-2 text-xs">Slight increase in player&apos;s portion of points</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2"><span className="text-gray-500 font-bold">--</span></td>
                            <td className="px-4 py-2 text-xs">No change in player&apos;s portion of points</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2"><span className="text-red-300 font-bold">↓</span></td>
                            <td className="px-4 py-2 text-xs">Slight decrease in player&apos;s portion of points</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2"><span className="text-red-600 font-bold">↓</span></td>
                            <td className="px-4 py-2 text-xs">Significant decrease in player&apos;s portion of points</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 rounded-bl-lg"><span className="text-white font-bold">💀</span></td>
                            <td className="px-4 py-2 text-xs">Player needs to teardown retool</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
