/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    return [
      {
        // Public pages - allow bfcache
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Privacy page - allow bfcache
        source: '/privacy',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Static assets - long cache
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Images and other static files
        source: '/(favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg)',
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
      // {
      //   source: '/league',
      //   destination: '/league/teams',
      //   permanent: false, // true for 301 redirect, false for 302 redirect
      // },
    ];
  },
};

module.exports = nextConfig;
