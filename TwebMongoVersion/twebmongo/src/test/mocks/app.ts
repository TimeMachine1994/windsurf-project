// Mock SvelteKit app stores and functions
import { writable } from 'svelte/store';

export const page = writable({
  url: new URL('http://localhost:5173'),
  params: {},
  route: { id: null },
  status: 200,
  error: null,
  data: {},
  form: null
});

export const updated = writable(false);

export const navigating = writable(null);

export function goto(url: string | URL) {
  return Promise.resolve();
}

export function invalidate(dependency?: string | ((url: URL) => boolean)) {
  return Promise.resolve();
}

export function invalidateAll() {
  return Promise.resolve();
}

export function preloadData(href: string) {
  return Promise.resolve();
}

export function preloadCode(...urls: string[]) {
  return Promise.resolve();
}

export function beforeNavigate(fn: (navigation: any) => void) {
  // Mock implementation
}

export function afterNavigate(fn: (navigation: any) => void) {
  // Mock implementation
}

export function onNavigate(fn: (navigation: any) => void) {
  // Mock implementation
}
