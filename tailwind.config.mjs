/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['media'],
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		container: {
			center: true,
			screens: {
				sm: "100%",
				md: "100%",
				lg: "72rem",
				xl: "80rem",
				"2xl": "80rem",
			},
			padding: '2rem',
		},
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
			colors: {
				// Blues palette
				'blue-darkest': '#084594',
				'blue-dark': '#2171b5',
				'blue-medium': '#4292c6',
				'blue-light': '#6baed6',
				'blue-lighter': '#9ecae1',
				'blue-lightest': '#c6dbef',

				// Light mode colors
				'light-theme': '#c6dbef',
				'primary-light': '#2171b5',
				'primary-hover-light': '#084594',

				// Dark mode colors
				'dark-theme': '#071428',
				'primary-dark': '#6baed6',
				'primary-hover-dark': '#9ecae1',

				// Neutrals
				'n200': '#d7d9da',
				'n900': '#222222',
				'n700': '#171F26',
				'n500': '#555555',
			},
    	}
    },
	plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
}
