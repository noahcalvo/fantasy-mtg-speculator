'use client';

import { State, createDraft } from '@/app/lib/draft';
import { useFormState } from 'react-dom';

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
    return createDraft(prevState, formData, leagueId, playerId);
  };

  const [state, dispatch] = useFormState(createDraftWithLeagueId, initialState);

  return (
    <form
      action={dispatch}
      className="flex flex-col gap-y-2 border bg-gray-50 p-4"
    >
      <h2 className="text-xl text-black md:text-2xl">Create New Draft</h2>
      <div className="flex flex-col gap-x-2 gap-y-2 lg:flex-row">
        <div className="flex flex-col gap-x-2 gap-y-2 xl:flex-row">
          <select
            id="set"
            name="set"
            className="peer block rounded-md border border-black py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
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
            className="peer block rounded-md border border-black py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
          />
        </div>
        <div className="flex flex-col gap-x-2 gap-y-2 xl:flex-row">
          <input
            type="text"
            id="name"
            name="name"
            placeholder="draft name"
            className="peer block rounded-md border border-black py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
          />

          <button
            type="submit"
            className="rounded border bg-black px-4 py-2 text-white hover:border-white hover:bg-red-800 hover:text-white"
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
