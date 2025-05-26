'use client';
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useEffect, useState } from 'react';
import { toZonedTime, format } from 'date-fns-tz';
import { fetchRecentSets } from '../lib/sets';
import { EPOCH } from '../consts';
import { LightNavTab } from './nav-tab';
import { capitalize, getAllWeeks, getCurrentWeek } from '../lib/utils';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  supportedFormats,
  format as formatType,
  Player,
} from '../lib/definitions';

export function SetPicker() {
  const [sets, setSets] = useState<string[]>(['all']);
  useEffect(() => {
    fetchRecentSets().then((result) => {
      setSets(result.concat('all'));
    });
  }, []);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSet = searchParams.get('set') ?? 'all';
  console.log('selectedSet', selectedSet);

  const router = useRouter();

  const handleSetChange = (event: SelectChangeEvent) => {
    router.push(
      `${pathname}?${createQueryString('set', event.target.value, searchParams)}`,
    );
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        flex: 1,
        '& .MuiInputLabel-root': {
          color: 'rgb(249 250 251)',
          '&.Mui-focused': {
            color: 'rgb(153 29 29)',
          },
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'rgb(107 114 128)',
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
      <InputLabel id="set-select-label">Set</InputLabel>
      <Select
        labelId="set-select-label"
        id="set-select"
        value={selectedSet}
        onChange={handleSetChange}
        label="Set"
      >
        {sets.map((set) => (
          <MenuItem key={set} value={set}>
            {capitalize(set)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function TeamPicker({
  teams,
  leagueId,
}: {
  teams: Player[];
  leagueId: number;
}) {
  const pathname = usePathname();

  // Extract the team ID from the pathname
  const pathParts = pathname.split('/');
  const activeTeam =
    pathname.startsWith(`/league/${leagueId}/teams/`) && pathParts.length >= 5
      ? pathParts[4]
      : null;

  const router = useRouter();

  const handleTeamChange = (event: SelectChangeEvent) => {
    const teamValue = event.target.value;
    router.push(`/league/${leagueId}/teams/${teamValue}`);
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        flex: 1,
        '& .MuiInputLabel-root': {
          color: 'rgb(107 114 128)',
          '&.Mui-focused': {
            color: 'rgb(153 29 29)',
          },
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'rgb(107 114 128)',
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
      <InputLabel id="team-select-label">Team</InputLabel>
      <Select
        labelId="team-select-label"
        id="team-select"
        value={activeTeam || ''}
        onChange={handleTeamChange}
        label="Team"
      >
        {teams.map((team) => (
          <MenuItem key={team.player_id} value={team.player_id}>
            {capitalize(team.name)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function WeekPicker() {
  const weeks = getAllWeeks();
  const weekOptions = getWeekStrings(weeks);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedWeek =
    searchParams.get('week')?.toLowerCase() ?? getCurrentWeek().toString();

  const router = useRouter();

  const handleWeekChange = (event: SelectChangeEvent) => {
    router.push(
      `${pathname}?${createQueryString('week', event.target.value, searchParams)}`,
    );
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        flex: 1,
        '& .MuiInputLabel-root': {
          color: 'rgb(249 250 251)',
          '&.Mui-focused': {
            color: 'rgb(153 29 29)',
          },
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'rgb(107 114 128)',
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
      <InputLabel id="week-select-label">Week</InputLabel>
      <Select
        labelId="week-select-label"
        id="week-select"
        value={selectedWeek}
        onChange={handleWeekChange}
        label="Week"
      >
        {/* for each item in formats, create a MenuItem */}
        {weekOptions.map((week) => (
          <MenuItem key={week.week} value={week.week}>
            {capitalize(week.label)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function getWeekStrings(weeks: number[]) {
  const sortedWeeks = weeks.sort((a, b) => b - a);
  return sortedWeeks.map((week) => {
    const date = new Date(EPOCH);
    date.setUTCDate(date.getUTCDate() + week * 7);
    const cstDate = toZonedTime(date, 'America/Chicago');
    const dateString = format(cstDate, 'MM/dd/yyyy', {
      timeZone: 'America/Chicago',
    });
    return { label: `${dateString}, week ${week}`, week };
  });
}

export function FormatPicker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedFormat: formatType =
    (searchParams.get('format')?.toLowerCase() as formatType) ??
    ('modern' as formatType);

  const router = useRouter();

  // Event handlers for form controls
  const handleFormatChange = (event: SelectChangeEvent) => {
    router.push(
      `${pathname}?${createQueryString('format', event.target.value, searchParams)}`,
    );
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        flex: 1,
        '& .MuiInputLabel-root': {
          color: 'rgb(249 250 251)',
          '&.Mui-focused': {
            color: 'rgb(153 29 29)',
          },
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'rgb(107 114 128)',
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
        value={selectedFormat}
        onChange={handleFormatChange}
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
  );
}

// Create URL update handler
const createQueryString = (
  name: string,
  value: string,
  searchParams: ReadonlyURLSearchParams,
) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set(name, value);
  return params.toString();
};

export function WeekPickerRouter({
  availableWeeks,
  leagueId,
}: {
  availableWeeks: number[];
  leagueId: number;
}) {
  const pathname = usePathname();
  const currentWeek = getCurrentWeek();
  return (
    <div>
      <div className="mt-4 flex">
        <LightNavTab
          name="all weeks"
          path={`/league/${leagueId}/standings/alltime`}
          active={pathname === `/league/${leagueId}/standings/alltime`}
        />
        <LightNavTab
          name={`${currentWeek}`}
          path={`/league/${leagueId}/standings`}
          active={
            pathname === `/league/${leagueId}/standings` ||
            pathname === `/league/${leagueId}/standings/${currentWeek}`
          }
        />

        {
          // for each week, create a new WeekPickerRouter
          availableWeeks.map((week) => {
            if (week === currentWeek) return null;
            return (
              <LightNavTab
                key={week}
                name={`${week}`}
                path={`/league/${leagueId}/standings/${week}`}
                active={pathname === `/league/${leagueId}/standings/${week}`}
              />
            );
          })
        }
      </div>
    </div>
  );
}
