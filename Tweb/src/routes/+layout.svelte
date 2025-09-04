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

<div class="flex flex-col min-h-screen">
	<header class="flex-shrink-0">
		<Header />
	</header>
	
	<main class="flex-1">
		{@render children()}
	</main>
	
	<footer class="flex-shrink-0">
		<Footer />
	</footer>
</div>

<ThemeToggleFixed />

