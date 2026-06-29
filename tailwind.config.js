/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS-переменные позволяют менять тему без перерендера JSX
        bg: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          soft: 'rgb(var(--bg-soft) / <alpha-value>)',
          card: 'rgb(var(--bg-card) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        },
        neon: {
          pink: '#ff3df0',
          purple: '#8b5cf6',
          cyan: '#22d3ee',
          violet: '#a855f7',
        },
        text: {
          DEFAULT: 'rgb(var(--text) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          dim: 'rgb(var(--text-dim) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #ff3df0 0%, #8b5cf6 50%, #22d3ee 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(139, 92, 246, 0.15) 0%, rgba(15, 11, 29, 0.95) 100%)',
        'gradient-hero': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168, 85, 247, 0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(255, 61, 240, 0.25) 0%, transparent 60%)',
      },
      boxShadow: {
        neon: '0 0 25px rgba(168, 85, 247, 0.5), 0 0 50px rgba(255, 61, 240, 0.3)',
        'neon-sm': '0 0 15px rgba(168, 85, 247, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-neon': 'pulseNeon 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)' },
          '50%': { boxShadow: '0 0 35px rgba(255, 61, 240, 0.7)' },
        },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
