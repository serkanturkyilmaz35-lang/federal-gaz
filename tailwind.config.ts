import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#b13329",
                secondary: "#292828",
                accent: "#f4b834",
                "background-light": "#f8f6f6",
                "background-dark": "#1f1413",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
            },
            animation: {
                marquee: 'marquee 15s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
