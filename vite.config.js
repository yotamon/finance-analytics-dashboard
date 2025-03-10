import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		react(),
		tailwindcss({
			darkMode: "class",
			theme: {
				colors: {
					primary: {
						50: "rgb(var(--color-primary-50) / <alpha-value>)",
						100: "rgb(var(--color-primary-100) / <alpha-value>)",
						200: "rgb(var(--color-primary-200) / <alpha-value>)",
						300: "rgb(var(--color-primary-300) / <alpha-value>)",
						400: "rgb(var(--color-primary-400) / <alpha-value>)",
						500: "rgb(var(--color-primary-500) / <alpha-value>)",
						600: "rgb(var(--color-primary-600) / <alpha-value>)",
						700: "rgb(var(--color-primary-700) / <alpha-value>)",
						800: "rgb(var(--color-primary-800) / <alpha-value>)",
						900: "rgb(var(--color-primary-900) / <alpha-value>)",
						950: "rgb(var(--color-primary-950) / <alpha-value>)"
					}
				}
			}
		})
	]
});
