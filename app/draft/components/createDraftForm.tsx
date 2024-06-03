'use client';

import { createDraft } from '@/app/lib/draft';
import { fetchRecentSets } from '@/app/lib/sets';
import { useFormState } from 'react-dom';

export default function CreateDraftForm({ sets }: { sets: string[] }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createDraft, initialState);

  return (
    <form action={dispatch} className="flex flex-col gap-y-2 p-4 border border-white m-1">
      <h2 className="text-xl md:text-2xl text-white">Create New Draft</h2>
      <div className="flex flex-col gap-x-2 gap-y-2 lg:flex-row">
        <div className="flex flex-col gap-x-2 gap-y-2 xl:flex-row">
        <select
          id="set"
          name="set"
          className="peer block rounded-md border border-white py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:ring-red-800 focus:border-red-800"
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
          className="peer block rounded-md border border-white py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:ring-red-800 focus:border-red-800"
        />
        </div>
        <div className='flex flex-col gap-x-2 gap-y-2 xl:flex-row'>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="draft name"
          className="peer block rounded-md border border-white py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:ring-red-800 focus:border-red-800"
        />

        <button
          type="submit"
          className="rounded bg-white px-4 py-2 text-black hover:text-white hover:bg-red-800 border hover:border-white"
        >
          Create
        </button>
        </div>
      </div>{state.message && <p className='text-red-700'>{state.errors?.name} {state.errors?.rounds} {state.errors?.set}</p>}
    </form>
  );
}

export { CreateDraftForm };
