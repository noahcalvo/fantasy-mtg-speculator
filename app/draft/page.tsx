import { auth } from '@/auth';
import { createDraft } from '@/app/lib/draft';
import { fetchRecentSets } from '../lib/sets';
import { SetPicker } from '../ui/picker';
import { useEffect, useState } from 'react';
import { CreateDraftForm } from './components/createDraftForm';
import { DraftList } from './components/draftList';

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  const userName = user?.name || "";
  const userEmail = user?.email || "";  
  const sets = await fetchRecentSets();
  
  return (
    <main className='mb-4'>
      {/* <h1 className="mb-4 text-xl md:text-2xl">
        Welcome to the Draft {userName || userEmail || ""}
      </h1> */}
    <CreateDraftForm sets={sets}/>
    <DraftList />
    </main>
  );
}