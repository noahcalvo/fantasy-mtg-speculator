import Link from 'next/link';

export function DarkNavTab({
  name,
  path,
  active,
}: {
  name: string;
  path: string;
  active: boolean;
}) {
  return (
    <Link
      href={path}
      className={`flex h-10 items-center rounded-t-lg border border-white px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white 
      ${active ? 'bg-gray-50 text-black ' : 'bg-black text-white'}
        `}
    >
      {name}
    </Link>
  );
}

export function LightNavTab({
  name,
  path,
  active,
}: {
  name: string;
  path: string;
  active: boolean;
}) {
  return (
    <Link
      href={path}
      className={`flex h-10 items-center rounded-l-lg border border-black px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:rounded-t-lg sm:rounded-bl-none 
      ${active ? 'bg-black text-white ' : 'bg-gray-50 text-black'}
        `}
    >
      {name}
    </Link>
  );
}
