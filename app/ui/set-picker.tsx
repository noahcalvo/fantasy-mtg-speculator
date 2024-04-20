'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function SetPicker({
  placeholder,
  sets
}: {
  placeholder: string;
  sets: string[];
}) {
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
