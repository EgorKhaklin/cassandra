import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#05070a',
        graphite: '#0e131a',
        slate: {
          950: '#0a0e14',
          900: '#11161e',
          800: '#1a212c',
          700: '#262f3e',
          600: '#3a4658',
          500: '#566377',
          400: '#7f8a9c',
          300: '#a3acbb',
          200: '#cad0db',
          100: '#e3e6ec',
        },
        ivory: '#e7e5df',
        gold: {
          DEFAULT: '#d4a437',
          dim: '#9c7a2b',
          bright: '#f0c155',
        },
        arterial: '#c8392f',
        abyss: '#2a4d99',
        // partisan
        rep: '#a83430',
        repDim: '#5e1e1c',
        dem: '#2554a6',
        demDim: '#152f5e',
        neutral: '#6a7280',
        ok: '#3a8a5f',
        warn: '#c69022',
        crit: '#b8312a',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Menlo', 'monospace'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.05em' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'reticule': 'reticule 1.4s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'toast-in': 'toast-in 240ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        reticule: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
