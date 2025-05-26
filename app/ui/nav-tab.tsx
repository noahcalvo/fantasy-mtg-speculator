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
      className={`flex h-10 items-center rounded-t-lg border border-gray-50 px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 
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
}: {
  name: string;
  path: string;
  active: boolean;
}) {
  return (
    <Link
      href={path}
      className={`flex h-10 items-center  rounded-t-lg border-black px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black
      ${active ? 'bg-gray-950 text-gray-50 ' : 'border-x border-t bg-gray-50 text-gray-950'}
      }
        `}
    >
      {name}
    </Link>
  );
}
