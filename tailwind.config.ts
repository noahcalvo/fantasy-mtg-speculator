import { transform } from 'next/dist/build/swc';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'inner-shadow': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.5)',
      },

      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        // Simple 16 column grid
        '16': 'repeat(16, minmax(0, 1fr))',

        // Complex site-specific column configuration
        'footer': '200px minmax(900px, 1fr) 100px',
      },

      colors: {
        blue: {
          400: '#2589FE',
          500: '#0070F3',
          600: '#2F6FEB',
        },
      },
    },
    animation: {
      'fly': 'fly 10s linear infinite',
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
      spin: {
        from: {
          transform: 'rotate(0deg)',
        },
        to: {
          transform: 'rotate(360deg)',
        }
      },
      fly: {
        '0%': { transform: 'translateX(0) rotate(0deg)' },
        '5%': { transform: 'translateX(10vw) rotate(90deg)' },
        '18%': { transform: 'translateX(60vw) rotate(70deg)' },
        '23%': { transform: 'translateX(60vw) rotate(-90deg)' },
        '38%': { transform: 'translateX(0) rotate(-70deg)' },
        '43%': { transform: 'translateX(0) rotate(0deg)' },
        '100%': { transform: 'translateX(0) rotate(0deg)' },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
