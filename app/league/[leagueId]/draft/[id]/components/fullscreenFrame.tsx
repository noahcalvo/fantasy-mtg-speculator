'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Props = {
  leagueId: number;
  draftId: number;
  draftName: string;
  children: React.ReactNode;
};

export default function FullscreenFrame({
  leagueId,
  draftName,
  children,
}: Props) {
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
        fs
          ? 'fixed inset-0 z-50 h-dvh w-dvw bg-gray-50 overflow-y-auto'
          : 'md:h-[calc(100dvh-74px)] h-[calc(100dvh-154px)] ',
      ]
        .filter(Boolean)
        .join(' '),
    [fs],
  );

  return (
    <div className={wrapperClass}>
      <main>
        <div className="mb-2 flex w-full items-center gap-2">
          <Link
            href={`/league/${leagueId}/draft`}
            className="rounded-md border border-gray-950 bg-gray-50 p-1 text-xs text-gray-950 transition-colors hover:bg-red-800 hover:text-gray-50"
          >
            All drafts
          </Link>

          {/* center flexible title cell (CSS-only, no JS) */}
          <div className="min-w-0 flex-1">
            {/* scroller: text-align centers when content fits; allows left-start when it overflows */}
            <div className="w-full overflow-x-auto text-center">
              {/* this equals the viewport width so centering works when small */}
              <div className="inline-block min-w-full">
                {/* actual content: won't shrink, will overflow and be scrollable from the left */}
                <div className="inline-block min-w-max whitespace-nowrap px-3">
                  <p className="text-2xl leading-none md:text-3xl">
                    {draftName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggle}
            className="rounded-md border border-gray-950 bg-gray-50 p-1 text-xs text-gray-950 transition-colors hover:bg-red-800 hover:text-gray-50"
          >
            {fs ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
