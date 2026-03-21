/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#0d5c2e',
          dark: '#0a4a24',
          light: '#117a3e',
        },
        chip: {
          white: '#f5f5f5',
          red: '#e53e3e',
          blue: '#3182ce',
          green: '#38a169',
          black: '#1a202c',
        },
        card: {
          heart: '#e53e3e',
          diamond: '#e53e3e',
          spade: '#1a202c',
          club: '#1a202c',
        },
        quality: {
          good: '#38a169',
          minor: '#ecc94b',
          major: '#e53e3e',
        },
      },
      animation: {
        'deal': 'deal 0.3s ease-out',
        'flip': 'flip 0.4s ease-in-out',
        'chip-move': 'chipMove 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.2s ease-in',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translateY(-100px) scale(0.5)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        chipMove: {
          '0%': { transform: 'translate(var(--from-x, 0), var(--from-y, 0))' },
          '100%': { transform: 'translate(0, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
