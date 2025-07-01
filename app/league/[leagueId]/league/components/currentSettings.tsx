'use client';

import { useState, useEffect } from 'react';
import { ScoringOption } from '@/app/lib/definitions';
import { deleteScoringSetting } from '@/app/lib/leagues';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/free-regular-svg-icons';
import { ScoringRow } from './scoringRow';

export default function CurrentScoringSettings({
  scoringOptions,
  playerId,
  isAdmin = false,
}: {
  scoringOptions: ScoringOption[];
  playerId: number;
  isAdmin?: boolean;
}) {
  const [selectedForDeletion, setSelectedForDeletion] = useState<number | null>(
    null,
  );
  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedForDeletion(null);
    };

    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleDeleteScoringOption = (option: ScoringOption) => {
    try {
      deleteScoringSetting(option, playerId);
    } catch (error) {
      console.error('Failed to delete scoring option:', error);
    }
  };

  return (
    <div className="mb-4 rounded-xl bg-gray-950 pt-4 text-gray-50">
      <h2 className="mx-2 text-center text-md">Current Scoring</h2>
      <div className="mb-4 px-2 text-center text-sm">
        (<FontAwesomeIcon icon={faClone} className="w-4" /> = points per copy)
      </div>
      <div className="px-2">
        {scoringOptions.length == 0 ? (
          <p className="p-4 text-sm">
            No scoring options found. Please add scoring rules to your league.
          </p>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-x-2 rounded p-2 text-sm md:grid-cols-4">
              <div>Format</div>
              <div>Type</div>
              <div>Points</div>
              <div></div>
            </div>
            <div className="w-full border-t border-solid border-gray-100"></div>
            {scoringOptions.map((option, index) => (
              <ScoringRow
                key={index}
                option={option}
                index={index}
                selectedForDeletion={selectedForDeletion}
                setSelectedForDeletion={setSelectedForDeletion}
                onDelete={handleDeleteScoringOption}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
