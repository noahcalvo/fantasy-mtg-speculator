import { auth } from '@/auth';

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  return (
    <main className="mb-4">
        <div className='text-white'>Try selecting one of the above options</div>
    </main>
  );
}
