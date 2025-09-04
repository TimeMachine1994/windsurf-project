import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/skeleton/plugin';
import * as themes from '@skeletonlabs/skeleton/themes';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/@skeletonlabs/skeleton-svelte/dist/**/*.{html,js,svelte,ts}'
	],
	theme: {
		screens: {
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px'
		},
		extend: {
			colors: {
				// Custom Tributestream brand colors
				'tributestream-gold': {
					50: '#fef7e7',
					100: '#fdecc4',
					200: '#fbd896',
					300: '#f8c158',
					400: '#f5ab2a',
					500: '#D5BA7F', // Primary gold
					600: '#C5A86F', // Primary gold dark
					700: '#a67c1a',
					800: '#8b6914',
					900: '#735617',
					950: '#422e09'
				},
				'tributestream-grey': {
					50: '#f8f8f8',
					100: '#efefef',
					200: '#dcdcdc',
					300: '#bdbdbd',
					400: '#989898',
					500: '#A8A8A6', // Secondary grey
					600: '#656565',
					700: '#525252',
					800: '#464646',
					900: '#3d3d3d',
					950: '#262626'
				}
			}
		}
	},
	darkMode: 'class',
	plugins: [
		require('@tailwindcss/forms'),
		skeleton({
			themes: {
				preset: [themes.cerberus],
				custom: [
					{
						name: 'tributestream',
						properties: {
							// Primary colors (gold)
							'--color-primary-50': '#fef7e7',
							'--color-primary-100': '#fdecc4',
							'--color-primary-200': '#fbd896',
							'--color-primary-300': '#f8c158',
							'--color-primary-400': '#f5ab2a',
							'--color-primary-500': '#D5BA7F',
							'--color-primary-600': '#C5A86F',
							'--color-primary-700': '#a67c1a',
							'--color-primary-800': '#8b6914',
							'--color-primary-900': '#735617',
							'--color-primary-950': '#422e09',
							
							// Secondary colors (grey)
							'--color-secondary-50': '#f8f8f8',
							'--color-secondary-100': '#efefef',
							'--color-secondary-200': '#dcdcdc',
							'--color-secondary-300': '#bdbdbd',
							'--color-secondary-400': '#989898',
							'--color-secondary-500': '#A8A8A6',
							'--color-secondary-600': '#656565',
							'--color-secondary-700': '#525252',
							'--color-secondary-800': '#464646',
							'--color-secondary-900': '#3d3d3d',
							'--color-secondary-950': '#262626',
							
							// Surface colors for light mode
							'--color-surface-50': '#ffffff',
							'--color-surface-100': '#f8fafc',
							'--color-surface-200': '#f1f5f9',
							'--color-surface-300': '#e2e8f0',
							'--color-surface-400': '#cbd5e1',
							'--color-surface-500': '#94a3b8',
							'--color-surface-600': '#64748b',
							'--color-surface-700': '#475569',
							'--color-surface-800': '#334155',
							'--color-surface-900': '#1e293b',
							'--color-surface-950': '#0f172a'
						}
					},
					{
						name: 'tributestream-dark',
						properties: {
							// Primary colors remain gold in dark mode
							'--color-primary-50': '#fef7e7',
							'--color-primary-100': '#fdecc4',
							'--color-primary-200': '#fbd896',
							'--color-primary-300': '#f8c158',
							'--color-primary-400': '#f5ab2a',
							'--color-primary-500': '#D5BA7F',
							'--color-primary-600': '#C5A86F',
							'--color-primary-700': '#a67c1a',
							'--color-primary-800': '#8b6914',
							'--color-primary-900': '#735617',
							'--color-primary-950': '#422e09',
							
							// Secondary colors (darker greys for dark mode)
							'--color-secondary-50': '#262626',
							'--color-secondary-100': '#3d3d3d',
							'--color-secondary-200': '#464646',
							'--color-secondary-300': '#525252',
							'--color-secondary-400': '#656565',
							'--color-secondary-500': '#4A5568',
							'--color-secondary-600': '#2D3748',
							'--color-secondary-700': '#718096',
							'--color-secondary-800': '#989898',
							'--color-secondary-900': '#bdbdbd',
							'--color-secondary-950': '#f8f8f8',
							
							// Dark mode surface colors
							'--color-surface-50': '#0f172a',
							'--color-surface-100': '#1e293b',
							'--color-surface-200': '#334155',
							'--color-surface-300': '#475569',
							'--color-surface-400': '#64748b',
							'--color-surface-500': '#94a3b8',
							'--color-surface-600': '#cbd5e1',
							'--color-surface-700': '#e2e8f0',
							'--color-surface-800': '#f1f5f9',
							'--color-surface-900': '#f8fafc',
							'--color-surface-950': '#ffffff'
						}
					}
				]
			}
		})
	]
} satisfies Config;
