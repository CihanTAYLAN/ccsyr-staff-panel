/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "var(--primary)",
                    dark: "var(--primary-dark)",
                    light: "var(--primary-light)",
                    lighter: "var(--primary-lighter)",
                },
                theme: {
                    bg: {
                        primary: "var(--theme-bg-primary)",
                        secondary: "var(--theme-bg-secondary)",
                        elevated: "var(--theme-bg-elevated)",
                        input: "var(--theme-bg-input)",
                    },
                    text: {
                        DEFAULT: "var(--theme-text)",
                        secondary: "var(--theme-text-secondary)",
                        disabled: "var(--theme-text-disabled)",
                    },
                },
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false, // Disable Tailwind's reset
    },
    important: true, // For compatibility with Ant Design
}
