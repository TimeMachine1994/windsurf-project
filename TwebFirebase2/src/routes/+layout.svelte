<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initAuthStore } from '$lib/stores/auth';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();

	onMount(() => {
		initAuthStore();
	});
</script>


<div class="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-[#D5BA7F]/30">
	<Header />
  
	<main class="flex-1">
		{@render children?.()}
	</main>
  
	<Footer />
</div>
