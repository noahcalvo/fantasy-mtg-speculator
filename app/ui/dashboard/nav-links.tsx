'use client';

import {
  BeakerIcon,
  HomeIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'League',
    href: '/league',
    icon: BeakerIcon,
  },
  { name: 'Draft', href: '/draft', icon: BoltIcon },
];

export default function NavLinks({leagueId, playerId}: {leagueId: number | undefined, playerId: number | null}) {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        link.href = link.href === '/league' && leagueId ? `/league/${leagueId}/teams/${playerId}` : link.href;
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'hover:border-white border border-black flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-800 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'white text-black': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
