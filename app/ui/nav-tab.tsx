import Link from 'next/link';

export function DarkNavTab({ name, path, active }: { name: string; path: string; active: boolean; }) {
  return (
    <Link
      href={path}
      className={`focus-visible:outline-white border border-white flex h-10 items-center rounded-t-lg px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
      ${active ? 'bg-white text-black ' : 'bg-black text-white'}
        `}
    >
      {name}
    </Link>
  );
}

export function LightNavTab({ name, path, active }: { name: string; path: string; active: boolean; }) {
  return (
    <Link
      href={path}
      className={`focus-visible:outline-black border border-black flex h-10 items-center rounded-l-lg px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
      ${active ? 'bg-black text-white ' : 'bg-white text-black'}
        `}
    >
      {name}
    </Link>
  );
}
