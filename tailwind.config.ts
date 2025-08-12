// tailwind.config.ts
import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import scrollbar from 'tailwind-scrollbar'

export default {
  theme: {
    extend: {
      boxShadow: {
        'inner-shadow': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.5)',
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
        footer: '200px minmax(900px, 1fr) 100px',
      },
      fontSize: {
        xs: '.6rem',
        sm: '.75rem',
        md: '1rem',
        lg: '4.65rem',
        xl: '2.75rem',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        fly: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '5%': { transform: 'translateY(-20px) rotate(90deg)' },
          '10%': { transform: 'translateY(20px) rotate(180deg)' },
          '20%': { transform: 'translateY(calc(560px - 80vw)) rotate(180deg) scale(.8)' },
          '25%': { transform: 'translateY(calc(590px - 80vw)) rotate(270deg) scale(.5)' },
          '30%': { transform: 'translateY(calc(560px - 80vw)) rotate(360deg) scale(.6)' },
          '40%': { transform: 'translateY(0) rotate(360deg)' },
          '100%': { transform: 'translateY(0) rotate(360deg)' },
        },
        spin: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        grow: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        fly: 'fly 10s linear infinite',
        spin: 'spin 1s linear infinite',
        grow: 'grow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [forms(), scrollbar({ nocompatible: true })],
} satisfies Config
