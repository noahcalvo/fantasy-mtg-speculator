'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function WeekPicker({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
  
  const weekOptions = [{"label":"week 0 - 4/8/2024", "week": 0}, {"label":"week 1 - 4/15/2024", "week": 1}];
  const handleSearch = useDebouncedCallback((week) => {
    const params = new URLSearchParams(searchParams);
    if (week) {
      params.set('week', week);
    } else {
      params.delete('week');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex-shrink-0 inline-block">
      <label htmlFor="weekPicker" className="sr-only">
        Week Picker
      </label>
      <select
        id="weekPicker"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('week')?.toString()}
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