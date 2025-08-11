'use client';
import clsx from 'clsx';
import { PowerIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LoginLink() {
  const pathname = usePathname();

  return (
    <Link
      href={pathname === '/signup' ? '/signup' : '/login'}
      className={clsx(
        'flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md border border-black bg-gray-50 p-3 text-md font-medium hover:border-gray-50 hover:bg-red-800 hover:text-gray-50 md:flex-none md:justify-start md:p-2 md:px-3',
        {
          'border-gray-50 bg-gray-950 text-gray-50':
            pathname === '/login' || pathname === '/signup',
          'border-black bg-gray-50 text-gray-950':
            pathname !== '/login' && pathname !== '/signup',
        },
      )}
    >
      <PowerIcon className="w-6" />
      <div className="hidden md:block">
        {pathname === '/signup' ? 'Sign up' : 'Log In'}
      </div>
    </Link>
  );
}
