'use client';

import { useState, useEffect } from 'react';
import { ScoringOption, supportedFormats } from '@/app/lib/definitions';
import { addScoringSetting, deleteScoringSetting } from '@/app/lib/leagues';
import { PlusIcon } from '@heroicons/react/20/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/free-regular-svg-icons';
import {
  capitalize,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
} from '@mui/material';

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
    <div>
      <div>
        <h2 className="text-md mx-2 mb-4 mt-4 inline-block">Scoring Setup</h2>
        <div className="mb-2 inline-block bg-gray-200 px-2 py-1 text-sm">
          <FontAwesomeIcon icon={faClone} className="w-4" /> = points per copy
        </div>
      </div>
      <section className="rounded border p-2 shadow">
        {scoringOptions.length == 0 ? (
          <p>
            No scoring options found. Please add scoring rules to your league.
          </p>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-x-2 rounded bg-gray-200 p-2 text-sm md:grid-cols-4">
              <div>Format</div>
              <div>Type</div>
              <div>Points</div>
              <div></div>
            </div>
            <div className="w-full border-y border-solid border-gray-100"></div>
            {scoringOptions.map((option, index) => (
              <div key={index}>
                <div
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
                  <div className="grid grid-cols-3 items-center gap-x-2 py-2 text-sm md:grid-cols-4">
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
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950 bg-opacity-50">
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
      <section className="mt-2 w-full rounded border p-2 shadow">
        <p className="text-md mb-4 rounded-sm bg-red-900 px-2 py-1 text-gray-50">
          Add New Rule
        </p>
        <div className="flex w-full md:block">
          <div className="grid w-full grid-cols-1 gap-4 rounded p-2 text-sm md:grid-cols-3">
            <div className="flex h-full items-center justify-center">
              <FormControl
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiInputLabel-root': {
                    color: 'rgb(3 7 18)',
                    '&.Mui-focused': {
                      color: 'rgb(153 29 29)',
                    },
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgb(3 7 18)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(127 29 29)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(127 29 29)',
                    },
                  },
                }}
              >
                <InputLabel id="format-select-label">Format</InputLabel>
                <Select
                  labelId="format-select-label"
                  id="format-select"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  label="Format"
                >
                  {/* for each item in formats, create a MenuItem */}
                  {supportedFormats.map((format) => (
                    <MenuItem key={format} value={format}>
                      {capitalize(format)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="flex h-full items-center justify-center">
              <FormControl
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiInputLabel-root': {
                    color: 'rgb(3 7 18)',
                    '&.Mui-focused': {
                      color: 'rgb(153 29 29)',
                    },
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgb(3 7 18)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(127 29 29)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(127 29 29)',
                    },
                  },
                }}
              >
                <InputLabel id="event-type-select-label">Event Type</InputLabel>
                <Select
                  labelId="event-type-select-label"
                  id="event-type-select"
                  value={tournamentType}
                  onChange={(e) => setTournamentType(e.target.value)}
                  label="Event Type"
                >
                  {/* for each item in formats, create a MenuItem */}
                  {tournamentTypeOptions.map((format) => (
                    <MenuItem key={format} value={format}>
                      {capitalize(format)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="flex h-full items-center justify-center text-center">
              <FormControl
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiInputLabel-root': {
                    color: 'rgb(3 7 18)',
                    '&.Mui-focused': {
                      color: 'rgb(153 29 29)',
                    },
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgb(3 7 18)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(153 27 27)', // Darker red border when focused
                    },
                    '&:focus-visible': {
                      outline: 'none', // Remove black outline when clicked
                    },
                    // Target the input element directly to remove focus ring
                    '& .MuiInputBase-input': {
                      outline: 'none', // Remove the default outline
                      backgroundColor: 'transparent', // Remove background color
                      '&:focus': {
                        outline: 'none', // Remove outline on focus
                        boxShadow: 'none', // Remove any box shadow
                        backgroundColor: 'transparent', // Keep transparent on focus
                      },
                      '&:focus-visible': {
                        outline: 'none', // Remove outline on focus-visible
                      },
                    },
                  },
                }}
              >
                <InputLabel id="points-label">Points</InputLabel>
                <OutlinedInput
                  id="points"
                  type="number"
                  value={points}
                  onChange={(e) =>
                    setPoints(
                      e.target.value === '' ? '' : parseFloat(e.target.value),
                    )
                  }
                  label="Points"
                />
              </FormControl>
              {tournamentType != 'Challenge Champion' && (
                <FontAwesomeIcon icon={faClone} className="w-8" />
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleAddScoringOption}
          className="mx-auto mt-4 flex bg-gray-950 px-2 py-1 text-gray-50"
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
