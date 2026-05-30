/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        colors: {
          primary: '#007BFF', // Replace with exact blue from logo
          secondary: '#1A1A1A', // Replace with exact gray/black from logo
          accent: '#00C1D4', // Teal from "SERVICES" text
          gray: {
            700: "#4A4A4A", // Text gray
            300: "#E5E5E5", // Border gray
          },
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      fontSize: {
        'xs': ['0.75rem', '1rem'], // font-size + line-height
        'sm': ['0.875rem', '1.25rem'],
        'base': ['1rem', '1.5rem'],
        'lg': ['1.125rem', '1.75rem'],
        'xl': ['1.25rem', '1.75rem'],
        '2xl': ['1.5rem', '2rem'],
        '3xl': ['1.875rem', '2.25rem'],
        '4xl': ['2.25rem', '2.5rem'],
        '5xl': ['3rem', '1'],
      },
    },
  },
  plugins: [],
};
