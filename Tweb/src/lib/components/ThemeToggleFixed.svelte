<script>
	import { themeStore } from '$lib/stores/theme';

	function toggleTheme() {
		themeStore.toggle();
	}
</script>

<button class="theme-toggle-fixed" on:click={toggleTheme} aria-label="Toggle theme">
	<span class="toggle-icon">🌓</span>
</button>

<style>
	.theme-toggle-fixed {
		position: fixed;
		bottom: 1rem;
		left: 1rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.8);
		border: 2px solid var(--color-primary);
		color: var(--color-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		transition: all 0.3s ease;
		z-index: 1000;
		backdrop-filter: blur(10px);
	}

	.theme-toggle-fixed:hover {
		background: rgba(0, 0, 0, 0.9);
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(213, 186, 127, 0.3);
	}

	[data-theme="dark"] .theme-toggle-fixed {
		color: white;
		border-color: white;
	}

	[data-theme="dark"] .theme-toggle-fixed:hover {
		box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
	}

	.toggle-icon {
		transition: transform 0.3s ease;
	}

	.theme-toggle-fixed:hover .toggle-icon {
		transform: rotate(180deg);
	}
</style>
