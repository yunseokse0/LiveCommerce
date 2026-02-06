import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(0.145 0 0)',
        foreground: 'oklch(0.985 0 0)',
        card: 'oklch(0.205 0 0)',
        primary: 'oklch(0.922 0 0)',
        secondary: 'oklch(0.269 0 0)',
        border: 'oklch(1 0 0 / 10%)',
      },
    },
  },
  plugins: [],
}
export default config
