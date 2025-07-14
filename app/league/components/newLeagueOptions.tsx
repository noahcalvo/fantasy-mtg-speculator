import Link from 'next/link';

export default function NewLeagueOptions() {
  return (
    <div className="absolute left-0 flex w-full flex-col items-center justify-center gap-8 py-32 md:relative">
      <h1 className="text-lg text-gray-50">New League</h1>
      <div className="flex gap-8">
        <NavButton href="/league/new/join" text="Join" />
        <NavButton href="/league/new/create" text="Create" />
      </div>
    </div>
  );
}

interface NavButtonProps {
  href: string;
  text: string;
  // icon: React.ReactNode;
}

function NavButton({ href, text }: NavButtonProps) {
  return (
    <Link
      href={href}
      className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-50 text-center text-gray-950 hover:bg-red-800 hover:text-gray-50"
    >
      {/* {icon} */}
      <p>{text}</p>
    </Link>
  );
}
