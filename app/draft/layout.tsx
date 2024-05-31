import SideNav from '@/app/ui/dashboard/sidenav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-1 md:overflow-y-auto md:p-12">{children}
      <footer className='text-white text-center p-4'>
        <div className='h-32'></div>
      </footer>
</div>
    </div>
  );
}