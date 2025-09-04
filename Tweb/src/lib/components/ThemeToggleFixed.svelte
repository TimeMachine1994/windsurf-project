<script>
	import { theme } from '$lib/stores/theme';

	function toggleTheme() {
		theme.toggle();
	}
</script>

<button 
	class="fixed bottom-4 left-4 w-12 h-12 rounded-full z-50 backdrop-blur-sm bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
	on:click={toggleTheme} 
	aria-label="Toggle theme"
>
	<span class="text-lg transition-transform hover:rotate-180">🌓</span>
</button>
