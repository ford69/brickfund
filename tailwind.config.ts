import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'var(--radius-lg)',
        '2xl': 'var(--radius-xl)',
      },
      colors: {
        brand: {
          blue: {
            50: 'rgb(var(--blue-50))',
            100: 'rgb(var(--blue-100))',
            200: 'rgb(var(--blue-200))',
            300: 'rgb(var(--blue-300))',
            400: 'rgb(var(--blue-400))',
            500: 'rgb(var(--blue-500))',
            600: 'rgb(var(--blue-600))',
            700: 'rgb(var(--blue-700))',
            800: 'rgb(var(--blue-800))',
            900: 'rgb(var(--blue-900))',
            950: 'rgb(var(--blue-950))',
          },
          neutral: {
            50: 'rgb(var(--neutral-50))',
            100: 'rgb(var(--neutral-100))',
            200: 'rgb(var(--neutral-200))',
            300: 'rgb(var(--neutral-300))',
            400: 'rgb(var(--neutral-400))',
            500: 'rgb(var(--neutral-500))',
            600: 'rgb(var(--neutral-600))',
            700: 'rgb(var(--neutral-700))',
            800: 'rgb(var(--neutral-800))',
            900: 'rgb(var(--neutral-900))',
            950: 'rgb(var(--neutral-950))',
          },
          brown: {
            50: 'rgb(var(--brown-50))',
            100: 'rgb(var(--brown-100))',
            200: 'rgb(var(--brown-200))',
            300: 'rgb(var(--brown-300))',
            400: 'rgb(var(--brown-400))',
            500: 'rgb(var(--brown-500))',
            600: 'rgb(var(--brown-600))',
            700: 'rgb(var(--brown-700))',
            800: 'rgb(var(--brown-800))',
            900: 'rgb(var(--brown-900))',
            950: 'rgb(var(--brown-950))',
          },
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
