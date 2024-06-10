import SideNav from '@/app/ui/dashboard/sidenav';
import { auth } from '@/auth';
import LeagueSelector from './components/leagueSelector';
import { useRouter } from 'next/router';
 

export default async function Layout({ children }: { children: React.ReactNode }) {
    const user = await auth().then((res) => res?.user);
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-1 md:overflow-y-auto md:p-12">
      <LeagueSelector user={user} >{children}</LeagueSelector>
      
      <footer className='text-white text-center p-4'>
        <div className='h-32'></div>
      </footer>
</div>
    </div>
  );
}