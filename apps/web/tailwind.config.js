/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
    extend: {
      colors: {
        // TECHMINES portfolio tokens (techmines.github.io)
        panel: { DEFAULT: '#0E0E0E', 2: '#171717' },
        line: '#2E2E2E',
        stroke: '#4D4D4D',
        dim: '#A9A9A9',
        body: '#E2E2E2',
        // Brand red scale (500 is the portfolio red)
        brand: {
          50:  '#fff0f3',
          100: '#ffd6de',
          200: '#ffacbc',
          300: '#FF6B6B',
          400: '#FF3B3B',
          500: '#FF2626', // Primary Brightest Red
          600: '#F5141F',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#2E2E2E',
        },
        green: { 400: '#39FF14', 500: '#32E012' },
        red: { 400: '#FF3B3B', 500: '#FF2626', 600: '#F5141F' },
        // Deepest black surface
        void: {
          50: '#171717', 100: '#0E0E0E', 200: '#080808', 300: '#080808', 400: '#000000', 500: '#000000', 900: '#000000',
        },
        zinc: {
          900: '#0a0a0a',
          800: '#141414',
          700: '#222222',
          600: '#444444',
          500: '#777777',
          400: '#aaaaaa',
          300: '#cccccc',
          200: '#e5e5e5',
          100: '#f5f5f5',
        },
      },
      fontFamily: {
        display: ['var(--font-chakra)', '"Chakra Petch"', '"Arial Narrow"', 'sans-serif'],
        sans: ['var(--font-plex)', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', '"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255,38,38, 0.55), 0 0 40px rgba(255,38,38, 0.2)',
        'neon-sm': '0 0 10px rgba(255,38,38, 0.45)',
        'neon-inner': 'inset 0 0 20px rgba(255,38,38, 0.08)',
        'void': '0 8px 32px rgba(0, 0, 0, 0.9)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'glow-in': 'glowIn 0.3s ease-out',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,38,38, 0.35)' },
          '50%': { boxShadow: '0 0 30px rgba(255,38,38, 0.8), 0 0 60px rgba(255,38,38, 0.3)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glowIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(255,38,38,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,38,38,0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
