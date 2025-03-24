'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { toZonedTime, format } from 'date-fns-tz';
import { fetchRecentSets } from '../lib/sets';
import { EPOCH } from '../consts';
import { DarkNavTab, LightNavTab } from './nav-tab';
import { capitalize, getCurrentWeek } from '../lib/utils';

export function SetPicker({ placeholder }: { placeholder: string }) {
  const [sets, setSets] = useState<string[]>([]);
  useEffect(() => {
    fetchRecentSets().then((result) => {
      setSets(result);
    });
  }, []);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((set) => {
    const params = new URLSearchParams(searchParams);
    if (set) {
      params.set('set', set);
    } else {
      params.delete('set');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative inline-block flex-shrink-0">
      <label htmlFor="setPicker" className="sr-only">
        Set Picker
      </label>
      <select
        id="setPicker"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('set')?.toString()}
      >
        <option value="">{placeholder}</option>
        {sets.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}

export function WeekPicker({
  placeholder,
  availableWeeks,
}: {
  placeholder: string;
  availableWeeks: number[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (week: string) => {
    const params = new URLSearchParams(searchParams);
    if (week) {
      params.set('week', week);
    } else {
      params.delete('week');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const weekOptions = getWeekStrings(availableWeeks);

  const overwriteablePlaceholder =
    searchParams.get('week')?.toString() ?? placeholder;

  return (
    <div className="relative inline-block flex-shrink-0">
      <label htmlFor="weekPicker" className="sr-only">
        Week Picker
      </label>
      <select
        id="weekPicker"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={overwriteablePlaceholder}
      >
        <option value="">{placeholder}</option>
        {weekOptions.map((option, index) => (
          <option key={index} value={option.week}>
            {option.label}
          </option>
        ))}
      </select>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}

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

function getWeekStrings(weeks: number[]) {
  const sortedWeeks = weeks.sort((a, b) => b - a);
  return sortedWeeks.map((week) => {
    const date = new Date(EPOCH);
    date.setUTCDate(date.getUTCDate() + week * 7);
    const cstDate = toZonedTime(date, 'America/Chicago');
    const dateString = format(cstDate, 'MM/dd/yyyy', {
      timeZone: 'America/Chicago',
    });
    return { label: `week ${week} - ${dateString}`, week };
  });
}

const formats = ['modern', 'standard'];

export function FormatPicker({ placeholder }: { placeholder: string }) {
  const [format, setFormat] = useState<string>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    const initialFormat = searchParams.get('format') ?? 'modern';
    setFormat(initialFormat);
  }, [searchParams]);

  const handleSearch = useDebouncedCallback((format) => {
    const params = new URLSearchParams(searchParams);
    const standardizedFormat = format.toLowerCase();
    if (standardizedFormat) {
      params.set('format', standardizedFormat);
    } else {
      params.delete('format');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative inline-block flex-shrink-0">
      <label htmlFor="formatPicker" className="sr-only">
        Format Picker
      </label>
      <select
        id="formatPicker"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={format}
      >
        {formats.map((option, index) => (
          <option key={index} value={option}>
            {capitalize(option)}
          </option>
        ))}
      </select>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
