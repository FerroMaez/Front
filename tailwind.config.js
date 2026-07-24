/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Marca ─────────────────────────────────────────────────
        brand: {
          50:  '#f5f5e6',
          100: '#e8e9c6',
          200: '#d0d28c',
          300: '#b9bc55',
          400: '#a4a843',
          500: '#8C903B',  // color corporativo
          600: '#6f7230',
          700: '#535524',
          800: '#383a18',
          900: '#1d1e0c',
        },
        // ── Acento "agua" (hidráulica) — vibrante ─────────────────
        aqua: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',  // acento principal
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // ── Tokens semánticos (light/dark vía CSS vars) ───────────
        bg: {
          base:     'var(--bg-base)',
          raised:   'var(--bg-raised)',
          surface:  'var(--bg-surface)',
          card:     'var(--bg-card)',
          nav:      'var(--bg-nav)',
          footer:   'var(--bg-footer)',
          input:    'var(--bg-input)',
        },
        tx: {
          1:   'var(--tx-1)',
          2:   'var(--tx-2)',
          3:   'var(--tx-3)',
          inv: 'var(--tx-inv)',
        },
        bd: {
          1:   'var(--bd-1)',
          2:   'var(--bd-2)',
          accent: 'var(--bd-accent)',
        },
        // ── Superficies heredadas (mantener compatibilidad) ───────
        surface: {
          DEFAULT: 'var(--bg-raised)',
          1: 'var(--bg-raised)',
          2: 'var(--bg-surface)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow:    '0 0 40px -8px rgba(140,144,59,0.4)',
        'glow-sm': '0 0 20px -4px rgba(140,144,59,0.3)',
        'glow-aqua': '0 0 44px -8px rgba(6,182,212,0.45)',
        'card-light': '0 2px 16px -4px rgba(140,144,59,0.12)',
        // ── Sombras premium en capas ──
        soft:   '0 2px 8px -2px rgba(20,22,8,0.06), 0 6px 20px -6px rgba(20,22,8,0.08)',
        raised: '0 4px 14px -4px rgba(20,22,8,0.10), 0 14px 40px -12px rgba(20,22,8,0.14)',
        float:  '0 8px 24px -8px rgba(20,22,8,0.16), 0 24px 60px -20px rgba(20,22,8,0.24)',
      },
      keyframes: {
        'flow-shift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%':      { transform: 'translate3d(3%,-4%,0) scale(1.08)' },
        },
        'flow-shift-alt': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1.05)' },
          '50%':      { transform: 'translate3d(-4%,3%,0) scale(1)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'flow':      'flow-shift 14s ease-in-out infinite',
        'flow-alt':  'flow-shift-alt 18s ease-in-out infinite',
        'gradient':  'gradient-pan 8s ease infinite',
        'float-y':   'float-y 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
