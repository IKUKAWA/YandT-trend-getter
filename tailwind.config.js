/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ネオモーフィズム カラーパレット
        neo: {
          light: '#f0f0f3',
          dark: '#1a1a1a',
          shadow: {
            light: '#d1d1d4',
            dark: '#0f0f0f',
            inset: '#ffffff',
          }
        },
        // グラスモーフィズム カラーパレット
        glass: {
          white: 'rgba(255, 255, 255, 0.25)',
          dark: 'rgba(0, 0, 0, 0.25)',
          border: 'rgba(255, 255, 255, 0.18)',
        },
        // プライマリーカラー (YouTube風)
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // セカンダリーカラー (TikTok風)
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // アクセントカラー
        accent: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          orange: '#f97316',
          teal: '#14b8a6',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neo-gradient': 'linear-gradient(145deg, #f0f0f3, #d1d1d4)',
        'neo-gradient-dark': 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      boxShadow: {
        // ネオモーフィズム シャドウ
        'neo': '20px 20px 60px #d1d1d4, -20px -20px 60px #ffffff',
        'neo-inset': 'inset 20px 20px 60px #d1d1d4, inset -20px -20px 60px #ffffff',
        'neo-dark': '20px 20px 60px #0f0f0f, -20px -20px 60px #2a2a2a',
        'neo-inset-dark': 'inset 20px 20px 60px #0f0f0f, inset -20px -20px 60px #2a2a2a',
        // グラスモーフィズム シャドウ
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 20px 40px 0 rgba(31, 38, 135, 0.4)',
        // ホバー効果
        'neo-hover': '10px 10px 30px #d1d1d4, -10px -10px 30px #ffffff',
        'neo-hover-dark': '10px 10px 30px #0f0f0f, -10px -10px 30px #2a2a2a',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        shimmer: {
          '0%': {
            'background-position': '-200% 0'
          },
          '100%': {
            'background-position': '200% 0'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}