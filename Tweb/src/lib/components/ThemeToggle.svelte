<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let mounted = false;

	onMount(() => {
		theme.init();
		mounted = true;
	});

	function toggleTheme() {
		theme.toggle();
	}
</script>

{#if mounted}
	<button 
		class="flex items-center gap-2 rounded-full md:px-4 md:py-2 px-2 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-700 dark:text-primary-300 border border-primary-500/30 hover:border-primary-500/50 transition-all duration-200"
		on:click={toggleTheme}
		aria-label="Toggle theme"
		title="Toggle light/dark mode"
	>
		{#if $theme === 'light'}
			<span class="text-base">🌙</span>
			<span class="hidden md:inline font-medium">Dark</span>
		{:else}
			<span class="text-base">☀️</span>
			<span class="hidden md:inline font-medium">Light</span>
		{/if}
	</button>
{/if}
