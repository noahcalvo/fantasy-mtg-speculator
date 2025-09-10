// next.config.js
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {import('next').NextConfig} */
module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    experimental: {
      optimizePackageImports: ['@heroicons/react'],
    },
    swcMinify: true,
    images: {
      formats: ['image/webp', 'image/avif'],
      // Don't cache image optimizer output in dev
      minimumCacheTTL: isDev ? 0 : 60,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cards.scryfall.io',
          port: '',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: 'svgs.scryfall.io',
          port: '',
          pathname: '**',
        },
      ],
    },
    async headers() {
      if (isDev) {
        // Turn off caching across the board while developing
        return [
          {
            source: '/:path*',
            headers: [{ key: 'Cache-Control', value: 'no-store' }],
          },
        ];
      }

      // PROD: your original headers
      return [
        {
          source: '/',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=0, must-revalidate',
            },
          ],
        },
        {
          source: '/privacy',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=0, must-revalidate',
            },
          ],
        },
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/(favicon.ico|.*\\.(png|jpg|jpeg|gif|svg))',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, must-revalidate',
            },
          ],
        },
      ];
    },

    async redirects() {
      return [
        // your redirects here
      ];
    },
  };
};
