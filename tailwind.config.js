/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Cardano brand colors with WCAG 2.2 AA compliance
        cardano: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Primary Cardano blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Governance status colors
        governance: {
          active: '#10b981',    // green-500 - WCAG AA compliant
          pending: '#f59e0b',   // amber-500 - WCAG AA compliant
          expired: '#ef4444',   // red-500 - WCAG AA compliant
          ratified: '#3b82f6', // blue-500 - WCAG AA compliant
          rejected: '#dc2626',  // red-600 - WCAG AA compliant
        },
        // Vote colors with high contrast
        vote: {
          yes: '#059669',      // emerald-600 - High contrast
          no: '#dc2626',       // red-600 - High contrast  
          abstain: '#6b7280',  // gray-500 - High contrast
        },
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        // Cardano-specific animations
        "pulse-cardano": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-cardano": "pulse-cardano 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-in",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // WCAG 2.2 compliant font sizes
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
      },
      spacing: {
        // Touch target sizes (WCAG 2.2)
        'touch': '44px',
        'touch-sm': '32px',
      },
      minWidth: {
        'touch': '44px',
      },
      minHeight: {
        'touch': '44px',
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
      zIndex: {
        'modal': '1000',
        'dropdown': '1010',
        'tooltip': '1020',
        'toast': '1030',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom plugin for accessibility helpers
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.sr-only-focusable': {
          '&:not(:focus):not(:focus-within)': {
            position: 'absolute !important',
            width: '1px !important',
            height: '1px !important',
            padding: '0 !important',
            margin: '-1px !important',
            overflow: 'hidden !important',
            clip: 'rect(0, 0, 0, 0) !important',
            whiteSpace: 'nowrap !important',
            border: '0 !important',
          },
        },
        '.focus-visible-ring': {
          '&:focus-visible': {
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: `0 0 0 2px ${theme('colors.cardano.500')}`,
          },
        },
        '.high-contrast': {
          forcedColorAdjust: 'none',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
}