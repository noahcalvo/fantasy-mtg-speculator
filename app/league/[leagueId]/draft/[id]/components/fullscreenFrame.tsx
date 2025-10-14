'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Props = {
  leagueId: number;
  draftId: number;
  header: React.ReactNode;
  children: React.ReactNode;
};

export default function FullscreenFrame({ leagueId, header, children }: Props) {
  const [fs, setFs] = useState(false);

  // 1) read once from URL (no Next navigation)
  useEffect(() => {
    const isFs =
      new URLSearchParams(window.location.search).get('fullscreen') === 'true';
    setFs(isFs);
  }, []);

  // small helper: update URL without navigation or refetch
  const setUrlFs = (on: boolean) => {
    const url = new URL(window.location.href);
    if (on) url.searchParams.set('fullscreen', 'true');
    else url.searchParams.delete('fullscreen');
    window.history.replaceState(null, '', url.toString());
  };

  // 2) toggle local state + 3) sync URL via history API
  const toggle = () => {
    setFs((prev) => {
      const next = !prev;
      setUrlFs(next);
      return next;
    });
  };

  const wrapperClass = useMemo(
    () =>
      [
        'p-2',
        fs && 'fixed inset-0 z-50 h-dvh w-dvw bg-gray-50 overflow-y-auto', // use fixed, not absolute
      ]
        .filter(Boolean)
        .join(' '),
    [fs],
  );

  return (
    <div className={wrapperClass}>
      <main>
        <div className="mb-2 flex w-full flex-wrap items-center gap-2">
          <div>
            <Link
              href={`/league/${leagueId}/draft`}
              className="rounded-md border border-gray-950 bg-gray-50 px-1 py-1 text-xs text-gray-950 transition-colors hover:bg-red-800 hover:text-gray-50"
            >
              All drafts
            </Link>
          </div>

          <div className="inline-flex flex-1 content-center justify-center text-center">
            {header}
          </div>

          <button
            type="button"
            onClick={toggle}
            className="rounded-md border border-gray-950 bg-gray-50 px-1 py-1 text-xs text-gray-950 transition-colors hover:bg-red-800 hover:text-gray-50"
          >
            {fs ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
