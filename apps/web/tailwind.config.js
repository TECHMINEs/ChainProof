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
        // Sharp Edged Plasma Brand Colors
        brand: {
          50:  '#fff0f3',
          100: '#ffd6de',
          200: '#ffacbc',
          300: '#FF6B6B',
          400: '#FF3B3B',
          500: '#FF0000', // Primary Brightest Red
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        cyber: {
          orange: '#FF5F1F',
          cyan: '#00FFFF',
          green: '#39FF14',
          red: '#FF0000',
        },
        cyan: { 300: '#66FFFF', 400: '#00FFFF', 500: '#00E5E5' },
        green: { 400: '#39FF14', 500: '#32E012' },
        emerald: { 400: '#39FF14', 500: '#32E012' },
        orange: { 400: '#FF7A45', 500: '#FF5F1F' },
        red: { 400: '#FF3B3B', 500: '#FF0000', 600: '#DC2626' },
        // Deepest black surface
        void: {
          50:  '#111111',
          100: '#0a0a0a',
          200: '#070707',
          300: '#050505',
          400: '#030303',
          500: '#020202',
          900: '#000000',
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'plasma-sm': '0 0 10px rgba(255, 0, 0, 0.45)',
        'plasma': '0 0 20px rgba(255, 0, 0, 0.65)',
        'plasma-lg': '0 0 35px rgba(255, 0, 0, 0.85)',
        'cyber-cyan': '0 0 15px rgba(0, 255, 255, 0.5)',
        'cyber-orange': '0 0 15px rgba(255, 95, 31, 0.5)',
        'neon': '0 0 20px rgba(255, 0, 0, 0.55), 0 0 40px rgba(255, 0, 0, 0.2)',
        'neon-sm': '0 0 10px rgba(255, 0, 0, 0.45)',
        'neon-inner': 'inset 0 0 20px rgba(255, 0, 0, 0.08)',
        'void': '0 8px 32px rgba(0, 0, 0, 0.9)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'glow-in': 'glowIn 0.3s ease-out',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 0, 0, 0.35)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.3)' },
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
        'grid-pattern': 'linear-gradient(rgba(255,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
