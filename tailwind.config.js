/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cnp: {
          blue: '#1e40af',
          orange: '#ea580c',
          yellow: '#eab308',
          purple: '#7c3aed',
        },
      },
      fontFamily: {
        'noto-sans': ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}