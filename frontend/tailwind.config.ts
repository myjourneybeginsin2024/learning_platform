import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./templates/**/*.{js,ts,jsx,tsx,mdx}", // Include templates
    ],
    theme: {
        extend: {
            colors: {
                reddit: {
                    primary: "var(--color-reddit-primary)",
                    bg: "var(--color-reddit-bg)",
                    card: "var(--color-reddit-card)",
                    text: "var(--color-reddit-text)",
                    meta: "var(--color-reddit-meta)",
                    border: "var(--color-reddit-border)",
                    orange: "var(--color-reddit-orange)",
                    blue: {
                        DEFAULT: "var(--color-reddit-blue)",
                        hover: "var(--color-reddit-blue-hover)",
                    },
                    input: {
                        bg: "var(--color-reddit-input-bg)",
                    },
                },
            },
            borderRadius: {
                pill: "var(--radius-pill)",
                xl: "var(--radius-xl)",
                lg: "var(--radius-lg)",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
