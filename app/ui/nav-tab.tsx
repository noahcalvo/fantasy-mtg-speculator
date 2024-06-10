import Link from 'next/link';

export function NavTab({ name, path, active }: { name: string; path: string; active: boolean; }) {
  return (
    <Link
      href={path}
      className={`focus-visible:outline-white border flex h-10 items-center rounded-t-lg px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
      ${active ? 'bg-white text-black border-white' : 'bg-black text-white border-white'}
        `}
    >
      {name}
    </Link>
  );
}