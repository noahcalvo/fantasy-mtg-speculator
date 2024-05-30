import { fetchRecentSets } from '../lib/sets';
import { CreateDraftForm } from './components/createDraftForm';
import { DraftList } from './components/draftList';

export default async function Page() {
  const sets = await fetchRecentSets();
  
  return (
    <main className='mb-4'>
    <CreateDraftForm sets={sets}/>
    <DraftList />
    </main>
  );
}