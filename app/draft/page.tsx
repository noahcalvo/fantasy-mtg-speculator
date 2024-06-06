import { auth } from '@/auth';
import { fetchRecentSets } from '../lib/sets';
import { CreateDraftForm } from './components/createDraftForm';
import { DraftList } from './components/draftList';
import { isAdmin } from '../lib/actions';

export default async function Page() {
  const sets = await fetchRecentSets();
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const admin = await isAdmin(userEmail);
  return (
    <main className="mb-4">
      {admin && <CreateDraftForm sets={sets} />}
      <DraftList />
    </main>
  );
}
