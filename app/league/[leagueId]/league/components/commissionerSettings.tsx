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
import {
  formatOptions,
  tournamentTypeOptions,
  validatePoints,
} from '@/app/lib/utils';
import { ScoringRow } from './scoringRow';

export function CurrentSettings({
  scoringOptions,
  playerId,
}: {
  scoringOptions: ScoringOption[];
  playerId: number;
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
          <p>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AddNewRule({ leagueId }: { leagueId: number }) {
  const [format, setFormat] = useState(formatOptions[0]);
  const [tournamentType, setTournamentType] = useState(
    tournamentTypeOptions[0],
  );
  const [points, setPoints] = useState<number | ''>('');

  const handleAddScoringOption = async () => {
    const err = validatePoints(points);
    if (err) {
      alert(err);
      return;
    }

    if (!format || !tournamentType) {
      alert('Please fill out all fields correctly.');
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

  return (
    <div className="mb-4 rounded-xl bg-gray-950 px-2 py-4 text-gray-50">
      <h2 className="mx-2 mb-4 text-center text-md">New Rule</h2>
      <div className="flex w-full md:block">
        <div className="grid w-full grid-cols-1 gap-4 rounded p-2 text-sm md:grid-cols-3">
          <div className="flex h-full items-center justify-center">
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                flex: 1,
                color: 'rgb(249 250 251)',
                '& .MuiInputLabel-root': {
                  color: 'rgb(249 250 251)',
                  '&.Mui-focused': {
                    color: 'rgb(153 29 29)',
                  },
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgb(249 250 251)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgb(127 29 29)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(127 29 29)',
                  },
                  '& .MuiSelect-select': {
                    color: 'rgb(249 250 251)',
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
                color: 'rgb(249 250 251)',
                '& .MuiInputLabel-root': {
                  color: 'rgb(249 250 251)',
                  '&.Mui-focused': {
                    color: 'rgb(153 29 29)',
                  },
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgb(249 250 251)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgb(127 29 29)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(127 29 29)',
                  },
                  '& .MuiSelect-select': {
                    color: 'rgb(249 250 251)',
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
                color: 'rgb(249 250 251)',
                '& .MuiInputLabel-root': {
                  color: 'rgb(249 250 251)',
                  '&.Mui-focused': {
                    color: 'rgb(153 29 29)',
                  },
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgb(249 250 251)',
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
                    color: 'rgb(249 250 251)',
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
        className="mx-auto mt-4 flex rounded-sm border border-gray-50 bg-gray-950 py-1 pl-2 pr-3 text-gray-50"
      >
        <span>
          <PlusIcon className="w-6" />
        </span>
        Add
      </button>
    </div>
  );
}
