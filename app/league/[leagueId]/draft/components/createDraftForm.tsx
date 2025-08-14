'use client';

import { State, createDraft } from '@/app/lib/draft';
import React from 'react';
import { useFormState } from 'react-dom';

const pickTimeOptions = [
  { name: '30 seconds', value: 30 },
  { name: '45 seconds', value: 45 },
  { name: '60 seconds', value: 60 },
  { name: '1.5 minutes', value: 90 },
  { name: '2 minutes', value: 120 },
  { name: '3 minutes', value: 180 },
  { name: '5 minutes', value: 300 },
  { name: '15 minutes', value: 900 },
  { name: '1 hour', value: 3600 },
  { name: '6 hours', value: 21600 },
  { name: '12 hours', value: 43200 },
  { name: '24 hours', value: 86400 },
];

export default function CreateDraftForm({
  sets,
  leagueId,
  playerId,
}: {
  sets: string[];
  leagueId: number;
  playerId: number;
}) {
  const initialState = { message: null, errors: {} };
  // Wrapper function that includes leagueId
  const createDraftWithLeagueId = async (
    prevState: State,
    formData: FormData,
  ) => {
    const pickDuration = autodraft ? Number(formData.get('pickTime')) : 0;

    return createDraft(prevState, formData, leagueId, playerId, pickDuration);
  };

  const [state, dispatch] = useFormState(createDraftWithLeagueId, initialState);

  const [autodraft, setAutodraft] = React.useState(false);

  return (
    <form action={dispatch} className="flex flex-col gap-y-4 bg-gray-50">
      <h2 className="mt-4 text-lg text-gray-950">New Draft</h2>
      <div className="flex flex-col gap-x-2 gap-y-4">
        <div className="flex flex-col gap-x-2 gap-y-2 xl:flex-row">
          <select
            id="set"
            name="set"
            className="peer block h-[42px] rounded-md border border-black py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
            defaultValue={'all'}
          >
            <option value="">select a set</option>
            {sets.map((set, index) => (
              <option key={index} value={set}>
                {set}
              </option>
            ))}
          </select>
          <input
            type="number"
            id="rounds"
            name="rounds"
            placeholder="rounds"
            className="peer block h-[42px] rounded-md border border-black py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
          />
          <input
            type="text"
            id="name"
            name="name"
            placeholder="draft name"
            className="peer block h-[42px] rounded-md border border-black py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
          />
        </div>
        <div className="flex flex-col gap-x-2 gap-y-2 xl:flex-row">
          <div className="flex items-center gap-x-2">
            <input
              type="checkbox"
              id="autodraft"
              name="autodraft"
              className="h-4 w-4 rounded border-black text-red-900 checked:bg-red-900 focus:ring-red-900"
              checked={autodraft}
              onChange={(e) => setAutodraft(e.target.checked)}
            />
            <label htmlFor="autodraft" className="text-sm text-gray-950">
              Enable Autodraft (doesn&apos;t actually work yet 🤫)
            </label>
          </div>
          <div>
            <label
              htmlFor="pickTime"
              className={`${autodraft ? '' : 'hidden'} mb-1 ml-2 text-sm text-gray-950`}
            >
              Pick Time
            </label>
            <select
              id="pickTime"
              name="pickTime"
              className={`${autodraft ? '' : 'hidden'} peer block h-[42px] rounded-md border border-black py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800`}
              defaultValue={60}
            >
              {pickTimeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded border-2 border-gray-950 bg-red-800 px-4 py-2 text-gray-50 hover:bg-red-950 hover:text-gray-50"
          >
            Create
          </button>
        </div>
      </div>
      {state.message && (
        <p className="text-red-700">
          {state.errors?.name} {state.errors?.rounds} {state.errors?.set}
        </p>
      )}
    </form>
  );
}

export { CreateDraftForm };
