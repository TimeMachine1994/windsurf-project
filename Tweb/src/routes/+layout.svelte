<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ThemeToggleFixed from '$lib/components/ThemeToggleFixed.svelte';
	import { authStore } from '$lib/stores/auth';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	
	let { children } = $props();
	
	// Initialize auth store and theme when the app loads
	onMount(() => {
		const unsubscribe = authStore.init();
		theme.init();
		
		// Cleanup on component destroy
		return () => {
			unsubscribe();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	<Header />
	<main>
		<slot />
	</main>
	<ThemeToggleFixed />
	<Footer />
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	.main-content {
		flex: 1;
	}
</style>
