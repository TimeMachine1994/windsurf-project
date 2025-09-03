import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

// Create the theme store
function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,
		set,
		toggle: () => update(theme => theme === 'light' ? 'dark' : 'light'),
		init: () => {
			if (browser) {
				// Check for saved theme preference or default to light
				const savedTheme = localStorage.getItem('theme') as Theme;
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
				
				set(initialTheme);
				applyTheme(initialTheme);
			}
		}
	};
}

export const theme = createThemeStore();

// Apply theme to document
export function applyTheme(currentTheme: Theme) {
	if (browser) {
		document.documentElement.setAttribute('data-theme', currentTheme);
		localStorage.setItem('theme', currentTheme);
	}
}

// Subscribe to theme changes and apply them
if (browser) {
	theme.subscribe(applyTheme);
}
