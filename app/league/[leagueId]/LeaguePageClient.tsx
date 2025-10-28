'use client';
import Image from 'next/image';

export default function LeaguePageClient({
  league,
}: {
  league: { name: string } | null;
}) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-between bg-white pt-24">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-950">Welcome to</h1>
        <h1 className="text-center text-4xl font-bold text-red-900">
          {league?.name || 'the League'}!
        </h1>
        <Image
          src="/spec.png"
          width="400"
          height="400"
          className=""
          alt="spec logo of creepy guy"
        />{' '}
      </div>
    </main>
  );
}
