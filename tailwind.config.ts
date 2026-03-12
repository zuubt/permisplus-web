import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: '#E44332',
        'primary-dark': '#C8382A',
        'primary-light': '#FDECE9',
        'primary-border': '#F7B1A9',
        accent: '#F59E0B',
        'accent-light': '#FEF3C7',
        success: '#22C55E',
        'success-light': '#DCFCE7',
        error: '#DD4B39',
        'error-light': '#FEE2E2',
        bg: '#FAFAFA',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        'text-primary': '#1F1F1F',
        'text-secondary': '#6B7280',
        'text-disabled': '#9CA3AF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(31, 31, 31, 0.06)',
        card: '0 2px 10px rgba(31, 31, 31, 0.04)',
      },
    },
  },
  plugins: [],
};
export default config;
