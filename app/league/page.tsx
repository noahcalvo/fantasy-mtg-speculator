import { auth } from '@/auth';
import LeagueSelector from './components/leagueSelector';

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  return (
    <main className="mb-4">
        <div className='text-white'>yoyoyo</div>
    </main>
  );
}
