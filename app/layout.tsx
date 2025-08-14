import './ui/global.css';
import SideNav from './ui/dashboard/sidenav';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fantasy MTG Speculator',
  description: 'Build your fantasy MTG lineup',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-950 font-mono">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <SpeedInsights />
        <Analytics />
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
          <div className="sticky top-0 z-30 w-full flex-none bg-gray-950 p-4 md:relative md:w-64 md:pr-0 lg:w-72 lg:pl-8 lg:pt-8">
            <SideNav />
          </div>
          <div className="flex-grow p-4 md:overflow-y-auto lg:p-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
