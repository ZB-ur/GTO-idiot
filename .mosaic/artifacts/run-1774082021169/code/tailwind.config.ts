import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        chip: {
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#22c55e',
          black: '#1f2937',
          white: '#f9fafb',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'deal': 'deal 0.3s ease-out',
        'chip-toss': 'chipToss 0.4s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translateY(-20px) scale(0.8)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        chipToss: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(var(--chip-dx, 0), var(--chip-dy, -20px)) scale(0.9)' },
          '100%': { transform: 'translate(var(--chip-target-x, 0), var(--chip-target-y, 0)) scale(1)' },
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

export default config;
