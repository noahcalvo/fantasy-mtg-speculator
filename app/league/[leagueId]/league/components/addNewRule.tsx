'use client';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

import { formatOptions, tournamentTypeOptions } from '@/app/lib/utils';
import { validatePoints } from '@/app/lib/utils';
import { addScoringSetting } from '@/app/lib/leagues';
import { DropdownField } from './dropdownField';
import { PointsInput } from './pointsInput';

export function AddNewRule({ leagueId }: { leagueId: number }) {
  const [format, setFormat] = useState(formatOptions[0]);
  const [tournamentType, setTournamentType] = useState(
    tournamentTypeOptions[0],
  );
  const [points, setPoints] = useState<number | ''>('');

  const handleAddScoringOption = async () => {
    const error = validatePoints(points);
    if (error || !format || !tournamentType) {
      alert(error || 'Please fill out all fields correctly.');
      return;
    }

    try {
      await addScoringSetting(leagueId, {
        format,
        tournament_type: tournamentType,
        is_per_copy: tournamentType !== 'Challenge Champion',
        points: Number(points),
        league_id: leagueId,
      });

      // Reset form
      setFormat(formatOptions[0]);
      setTournamentType(tournamentTypeOptions[0]);
      setPoints('');
    } catch (error) {
      console.error('Failed to add scoring option:', error);
    }
  };

  return (
    <div className="mb-4 rounded-xl bg-gray-950 px-2 py-4 text-gray-50">
      <h2 className="text-md mx-2 mb-4 text-center">New Rule</h2>
      <div className="flex w-full md:block">
        <div className="grid w-full grid-cols-1 gap-4 p-2 text-sm md:grid-cols-3">
          <DropdownField
            label="Format"
            value={format}
            options={formatOptions}
            onChange={setFormat}
          />
          <DropdownField
            label="Event Type"
            value={tournamentType}
            options={tournamentTypeOptions}
            onChange={setTournamentType}
          />
          <PointsInput
            value={points}
            onChange={setPoints}
            showIcon={tournamentType !== 'Challenge Champion'}
          />
        </div>
      </div>
      <button
        onClick={handleAddScoringOption}
        className="mx-auto mt-4 flex items-center gap-2 rounded-sm border border-gray-50 bg-gray-950 px-3 py-1 text-gray-50 hover:cursor-pointer hover:bg-red-900"
      >
        <PlusIcon className="w-5" />
        Add
      </button>
    </div>
  );
}
