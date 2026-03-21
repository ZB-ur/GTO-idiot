import type { Config } from 'tailwindcss';

const config: Config = {
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
          red: '#e74c3c',
          blue: '#3498db',
          green: '#2ecc71',
          black: '#2c3e50',
          white: '#ecf0f1',
        },
        card: {
          hearts: '#e74c3c',
          diamonds: '#e74c3c',
          clubs: '#2c3e50',
          spades: '#2c3e50',
        },
        severity: {
          minor: '#f59e0b',
          moderate: '#f97316',
          severe: '#ef4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'card-deal': 'cardDeal 0.3s ease-out',
        'chip-slide': 'chipSlide 0.4s ease-in-out',
        'fade-in': 'fadeIn 0.2s ease-in',
      },
      keyframes: {
        cardDeal: {
          '0%': { transform: 'translateY(-20px) scale(0.8)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        chipSlide: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
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
