/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cards.scryfall.io'],
    },
    async redirects() {
        return [
          {
            source: '/league',
            destination: '/league/teams',
            permanent: false, // true for 301 redirect, false for 302 redirect
          },
        ]
      },
    
};

module.exports = nextConfig;
