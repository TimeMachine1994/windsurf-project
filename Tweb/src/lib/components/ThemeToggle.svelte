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
		class="theme-toggle"
		on:click={toggleTheme}
		aria-label="Toggle theme"
		title="Toggle light/dark mode"
	>
		{#if $theme === 'light'}
			<span class="icon">🌙</span>
			<span class="text">Dark</span>
		{:else}
			<span class="icon">☀️</span>
			<span class="text">Light</span>
		{/if}
	</button>
{/if}

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 2px solid var(--color-primary);
		border-radius: 2rem;
		background: var(--color-background);
		color: var(--color-primary);
		cursor: pointer;
		transition: all 0.2s ease;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.theme-toggle:hover {
		background: var(--color-primary);
		color: var(--color-background);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px var(--color-primary-alpha);
	}

	.icon {
		font-size: 1rem;
		line-height: 1;
	}

	.text {
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.text {
			display: none;
		}
		
		.theme-toggle {
			padding: 0.5rem;
			border-radius: 50%;
			width: 2.5rem;
			height: 2.5rem;
			justify-content: center;
		}
	}
</style>
