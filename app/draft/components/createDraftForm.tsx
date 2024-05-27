'use client';

import { createDraft } from '@/app/lib/draft';
import { fetchRecentSets } from '@/app/lib/sets';
import { useFormState } from 'react-dom';

export default function CreateDraftForm({ sets }: { sets: string[] }) {

  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createDraft, initialState);

  return (
    <form action={dispatch} className="flex flex-col gap-y-2">
      <h2 className="text-xl md:text-2xl">Create New Draft</h2>
      <div className='flex flex-row gap-x-2'>
      <select
        id="set"
        name="set"
        className="peer block rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        defaultValue={"all"}
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
        className="peer block rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
      />
      <input
        type="text"
        id="name"
        name="name"
        placeholder="draft name"
        className="peer block rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
      />
      
      <button
        type="submit"
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Create New Draft
      </button>
      </div>
    </form>
  );
};

export { CreateDraftForm };
