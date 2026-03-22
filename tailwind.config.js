/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
          white: '#f8fafc',
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#22c55e',
          black: '#1e293b',
        },
        suit: {
          spade: '#1e293b',
          club: '#15803d',
          heart: '#dc2626',
          diamond: '#2563eb',
        },
        gto: {
          match: '#22c55e',
          minor: '#eab308',
          major: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '0.5rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.25)',
        table: '0 0 40px rgba(0, 0, 0, 0.3), inset 0 0 80px rgba(0, 0, 0, 0.2)',
        chip: '0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'deal': 'deal 0.4s ease-out',
        'flip': 'flip 0.5s ease-in-out',
        'chip-slide': 'chipSlide 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translateY(-100px) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        chipSlide: {
          '0%': { transform: 'translateX(50px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
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
