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
                blood: {
                    50: "#FEE2E2",
                    100: "#FEE2E2",
                    200: "#FECACA",
                    300: "#FCA5A5",
                    400: "#F87171",
                    500: "#EF4444",
                    600: "#DC2626",
                    700: "#991B1B",
                    800: "#7F1D1D",
                    900: "#450A0A",
                },
                dark: {
                    50: "#1A1A1A",
                    100: "#0F0F0F",
                    200: "#0A0A0A",
                    300: "#050505",
                    400: "#000000",
                },
            },
            fontFamily: {
                inter: ["Inter", "sans-serif"],
                orbitron: ["Orbitron", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "dark-red-gradient": "linear-gradient(135deg, #000000 0%, #1A0000 50%, #330000 100%)",
                "red-black-gradient": "linear-gradient(to bottom right, #DC2626, #000000)",
            },
            keyframes: {
                glow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(220, 38, 38, 0.5)" },
                    "50%": { boxShadow: "0 0 30px rgba(220, 38, 38, 0.8)" },
                },
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                pulse: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
            },
            animation: {
                glow: "glow 2s ease-in-out infinite",
                fadeIn: "fadeIn 0.5s ease-out",
                pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            boxShadow: {
                "red-glow": "0 0 20px rgba(220, 38, 38, 0.5)",
                "red-glow-lg": "0 0 30px rgba(220, 38, 38, 0.7)",
            },
        },
    },
    plugins: [],
};

export default config;
