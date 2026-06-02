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
      },
      boxShadow: {
        glow:    '0 0 40px -8px rgba(140,144,59,0.4)',
        'glow-sm': '0 0 20px -4px rgba(140,144,59,0.3)',
        'card-light': '0 2px 16px -4px rgba(140,144,59,0.12)',
      },
    },
  },
  plugins: [],
}
