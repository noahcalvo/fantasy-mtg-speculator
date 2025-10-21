import './ui/global.css';
import SideNav from './ui/dashboard/sidenav';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Fantasy MTG Speculator',
  description: 'Build your fantasy MTG lineup',
};

// Make sure mobile viewport behaves and uses safe areas
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-950 font-mono">
      <body className="min-h-[100dvh] bg-gray-950">
        <SpeedInsights />
        <Analytics />
        <div className="flex min-h-[100dvh] flex-col md:flex-row">
          <aside
            className="
              sticky top-[env(safe-area-inset-top)] z-30 w-full flex-none
              bg-gray-950 p-4 md:relative md:w-64 md:pr-0
              lg:h-[calc(100dvh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]
              lg:w-72 lg:overflow-hidden
            "
          >
            <SideNav />
          </aside>
          <main className="h-[calc(100dvh-112px)] min-w-0 flex-1 overflow-auto p-4 pb-[calc(16px+env(safe-area-inset-bottom))] md:h-[100dvh]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
