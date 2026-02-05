/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#054d3b', // Deep Green
                    light: '#086e54',
                    dark: '#022c22',
                },
                secondary: {
                    DEFAULT: '#d4af37', // Gold
                    light: '#eacb68',
                    dark: '#b08d1e',
                },
                accent: {
                    DEFAULT: '#171717', // Matte Black
                    light: '#262626',
                    dark: '#000000',
                },
                neutral: {
                    light: '#f9fafb',
                    DEFAULT: '#e5e7eb',
                    dark: '#374151',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}