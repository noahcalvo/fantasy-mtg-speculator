'use client';

import { useState, useEffect } from 'react';
import { ScoringOption } from '@/app/lib/definitions';
import { addScoringSetting, deleteScoringSetting } from '@/app/lib/leagues';
import { PlusIcon } from '@heroicons/react/20/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/free-regular-svg-icons';

const formatOptions = ['Standard', 'Modern'];
const tournamentTypeOptions = [
  'Challenge Champion',
  'Challenge Top 8',
  'League 5-0',
];

export function CommissionerSettings({
  leagueId,
  scoringOptions,
  playerId,
}: {
  leagueId: number;
  scoringOptions: ScoringOption[];
  playerId: number;
}) {
  const [format, setFormat] = useState(formatOptions[0]);
  const [tournamentType, setTournamentType] = useState(
    tournamentTypeOptions[0],
  );
  const [points, setPoints] = useState<number | ''>('');
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

  const handleAddScoringOption = async () => {
    if (!format || !tournamentType || points === '' || isNaN(points)) {
      alert('Please fill out all fields correctly.');
      return;
    }

    // if points has more than two decimal places, alert the user
    if (typeof points === 'number' && points % 1 !== 0) {
      const decimalPlaces = points.toString().split('.')[1].length;
      if (decimalPlaces > 2) {
        alert('Points can only have two decimal places.');
        return;
      }
    }

    if (points < 0) {
      alert('Points must be positive.');
      return;
    }

    try {
      await addScoringSetting(leagueId, {
        format,
        tournament_type: tournamentType,
        is_per_copy: tournamentType != 'Challenge Champion',
        points: Number(points),
        league_id: leagueId,
      });
      // Clear the form fields
      setFormat(formatOptions[0]);
      setTournamentType(tournamentTypeOptions[0]);
      setPoints('');
      // Optionally, refresh the scoring options list here
    } catch (error) {
      console.error('Failed to add scoring option:', error);
    }
  };

  const handleDeleteScoringOption = (option: ScoringOption) => {
    try {
      deleteScoringSetting(option, playerId);
    } catch (error) {
      console.error('Failed to delete scoring option:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Scoring Configuration</h2>
        <div className="text-small mb-1 inline-block bg-gray-200 px-2 py-1">
          <FontAwesomeIcon icon={faClone} className="w-4" /> = points recieved
          per copy in deck
        </div>
      </div>
      <section className="rounded border p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Current rules</h2>
        {scoringOptions.length == 0 ? (
          <p>
            No scoring options found. Please add scoring rules to your league.
          </p>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-4 rounded bg-gray-100 p-2 text-sm font-medium md:grid-cols-4">
              <div>Format</div>
              <div>Type</div>
              <div>Points</div>
              <div></div>
            </div>
            <div className="w-full border-y border-solid border-gray-100"></div>
            {scoringOptions.map((option, index) => (
              <div>
                <div
                  key={index}
                  className={`relative p-4 p${
                    selectedForDeletion === index ? 'shadow-lg' : ''
                  }`}
                  onClick={(e) => {
                    if (window.innerWidth < 768) {
                      setSelectedForDeletion(index);
                      e.stopPropagation();
                    }
                  }}
                >
                  <div className="grid grid-cols-3 items-center gap-4 py-2 md:grid-cols-4">
                    <div>{option.format}</div>
                    <div>{option.tournament_type}</div>
                    <div>
                      {option.points}{' '}
                      {option.is_per_copy ? (
                        <FontAwesomeIcon icon={faClone} className="w-8" />
                      ) : (
                        ''
                      )}
                    </div>
                    <button
                      className="mt-4 hidden bg-gray-950 px-2 py-1 text-gray-50 md:block"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScoringOption(option);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  {selectedForDeletion === index && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <button
                        className="bg-red-600 px-4 py-2 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScoringOption(option);
                          setSelectedForDeletion(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-full border-y border-solid border-gray-100"></div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="w-full rounded border p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Add rules</h2>
        <div className="flex w-full md:block">
          <div className="grid grid-cols-1 gap-4 rounded bg-gray-100 p-2 text-sm font-medium md:grid-cols-3">
            <div className="flex h-full items-center justify-center text-center">
              Format
            </div>
            <div className="flex h-full items-center justify-center text-center">
              Type
            </div>
            <div className="flex h-full items-center justify-center text-center">
              Points
            </div>
          </div>
          {/* Example scoring option */}
          <div className="grid w-full grid-cols-1 gap-4 rounded bg-gray-100 p-2 text-sm font-medium md:grid-cols-3">
            <div className="flex h-full items-center justify-center">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="select w-full text-center"
              >
                {formatOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex h-full items-center justify-center">
              <select
                value={tournamentType}
                onChange={(e) => setTournamentType(e.target.value)}
                className="select w-full text-center"
              >
                {tournamentTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex h-full items-center justify-center text-center">
              {tournamentType != 'Challenge Champion' && (
                <FontAwesomeIcon icon={faClone} className="w-8" />
              )}
              <input
                type="number"
                step="0.1"
                value={points}
                onChange={(e) =>
                  setPoints(
                    e.target.value === '' ? '' : parseFloat(e.target.value),
                  )
                }
                className="input w-full  text-center"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleAddScoringOption}
          className="mt-4 flex bg-gray-950 px-2 py-1 text-gray-50"
        >
          <span>
            <PlusIcon className="w-6" />
          </span>
          Add Scoring Option
        </button>
      </section>
    </div>
  );
}
