/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                pixel: ['Silkscreen', 'cursive'],
            },
            colors: {
                'dashboard': {
                    'bg': '#0f172a',
                    'card': '#1e293b',
                    'accent': '#3b82f6',
                    'success': '#22c55e',
                    'warning': '#f59e0b',
                    'danger': '#ef4444',
                }
            }
        },
    },
    plugins: [],
}
