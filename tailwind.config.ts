import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",
	content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				// Ana renkler
				primary: {
					DEFAULT: "var(--primary)",
					dark: "var(--primary-dark)",
					light: "var(--primary-light)",
					lighter: "var(--primary-lighter)",
				},
				// Semantik renkler
				success: {
					DEFAULT: "var(--success)",
					light: "var(--success-light)",
					dark: "var(--success-dark)",
				},
				warning: {
					DEFAULT: "var(--warning)",
					light: "var(--warning-light)",
					dark: "var(--warning-dark)",
				},
				error: {
					DEFAULT: "var(--error)",
					light: "var(--error-light)",
					dark: "var(--error-dark)",
				},
				info: {
					DEFAULT: "var(--info)",
					light: "var(--info-light)",
					dark: "var(--info-dark)",
				},
				// Nötr renkler
				neutral: {
					50: "var(--neutral-50)",
					100: "var(--neutral-100)",
					200: "var(--neutral-200)",
					300: "var(--neutral-300)",
					400: "var(--neutral-400)",
					500: "var(--neutral-500)",
					600: "var(--neutral-600)",
					700: "var(--neutral-700)",
					800: "var(--neutral-800)",
					900: "var(--neutral-900)",
				},
				// Tema tabanlı renkler
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
					border: {
						DEFAULT: "var(--theme-border)",
						light: "var(--theme-border-light)",
					},
					shadow: {
						DEFAULT: "var(--theme-shadow)",
						dark: "var(--theme-shadow-dark)",
					},
				},
			},
			boxShadow: {
				"theme-sm": "0 1px 2px var(--theme-shadow)",
				"theme-md": "0 4px 12px var(--theme-shadow)",
				"theme-lg": "0 8px 24px var(--theme-shadow-dark)",
			},
			backgroundImage: {
				"gradient-primary": "linear-gradient(to right, var(--primary), var(--primary-dark))",
			},
		},
	},
	plugins: [],
	// Add Ant Design compatibility
	corePlugins: {
		preflight: false,
	},
	important: true,
};

export default config;
