/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        // NestJS Signature Design Tokens mapped to dynamic theme CSS custom properties
        soot: {
          DEFAULT: "hsl(var(--background))",
          canvas: "hsl(var(--background))",
        },
        carbon: {
          DEFAULT: "hsl(var(--card))",
          panel: "hsl(var(--card))",
        },
        graphite: {
          DEFAULT: "hsl(var(--muted))",
          slab: "hsl(var(--muted))",
        },
        ash: {
          DEFAULT: "hsl(var(--secondary))",
          seam: "hsl(var(--secondary))",
        },
        smoke: {
          DEFAULT: "hsl(var(--border))",
          outline: "hsl(var(--border))",
        },
        pewter: {
          DEFAULT: "hsl(var(--muted-foreground))",
          text: "hsl(var(--muted-foreground))",
        },
        crimson: {
          DEFAULT: "#ea2845",
          nest: "#ea2845",
        },
        garnet: {
          DEFAULT: "#780f20",
          sweep: "#780f20",
        },
        bone: {
          DEFAULT: "hsl(var(--foreground))",
          white: "#ffffff",
        },
        iron: {
          DEFAULT: "#4e4e4e",
          gray: "#4e4e4e",
        },
        syntax: {
          keyword: "#ff7b72",
          string: "#ffa657",
          identifier: "#a5d6ff",
        },

        // Theme Token Variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        'frame': "32px",
        'card': "24px",
        'input': "24px",
        'button': "20px",
        'pill': "9999px",
        '2xl': "20px",
        '3xl': "24px",
        xl: "var(--radius)",
        lg: "calc(var(--radius) - 2px)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'fanned': '0 4px 10px 0 rgba(0, 0, 0, 0.2)',
        'glow-crimson': '0 0 35px -5px rgba(234, 40, 69, 0.25)',
        'glow-garnet': '0 0 50px -10px rgba(120, 15, 32, 0.35)',
        'smoke-ring': '0 0 0 1px rgba(255, 255, 255, 0.15)',
        'glass-light': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
