import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",
	content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {},
	},
	plugins: [],
	// Add Ant Design compatibility
	corePlugins: {
		preflight: false,
	},
	important: true,
};

export default config;
