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
      ${active ? 'bg-gray-50 text-gray-950' : 'bg-gray-950 text-gray-50'}
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
  stackVertically = false,
}: {
  name: string;
  path: string;
  active: boolean;
  stackVertically?: boolean;
}) {
  return (
    <Link
      href={path}
      className={`flex h-10 items-center  border-black px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black 
      ${active ? 'bg-gray-950 text-gray-50 ' : 'border-x border-t bg-gray-50 text-gray-950'}
      ${stackVertically ? 'rounded-l-lg border sm:rounded-t-lg sm:rounded-bl-none' : 'rounded-t-lg'}
      }
        `}
    >
      {name}
    </Link>
  );
}
