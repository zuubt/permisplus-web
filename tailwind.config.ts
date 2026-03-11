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
        primary: '#DB4C3F',
        'primary-dark': '#B03D32',
        'primary-light': '#FCECEB',
        'primary-border': '#F29D96',
        accent: '#FF9933',
        'accent-light': '#FFF0E0',
        success: '#058527',
        'success-light': '#E6F5EB',
        error: '#DD4B39',
        'error-light': '#FCECEB',
        bg: '#FAFAFA',
        surface: '#FFFFFF',
        border: '#F0F0F0',
        'text-primary': '#202020',
        'text-secondary': '#808080',
        'text-disabled': '#B3B3B3',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
