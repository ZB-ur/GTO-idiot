/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#0d5e3a',
          dark: '#0a4a2e',
          light: '#117a4c',
        },
        chip: {
          white: '#f5f5f5',
          red: '#dc2626',
          blue: '#2563eb',
          green: '#16a34a',
          black: '#1e1e1e',
        },
        card: {
          back: '#1e3a5f',
          face: '#fffef7',
        },
        suit: {
          hearts: '#dc2626',
          diamonds: '#dc2626',
          clubs: '#1a1a1a',
          spades: '#1a1a1a',
        },
        gto: {
          optimal: '#22c55e',
          minor: '#eab308',
          major: '#ef4444',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.3)',
        chip: '0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        felt: 'inset 0 0 60px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        card: '0.5rem',
      },
      animation: {
        'deal': 'deal 0.3s ease-out',
        'chip-slide': 'chipSlide 0.4s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translateY(-100px) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
        },
        chipSlide: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '100%': { transform: 'translateX(var(--chip-dx)) translateY(var(--chip-dy))' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(34, 197, 94, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
