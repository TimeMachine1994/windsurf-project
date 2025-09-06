<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth-mock';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { browser } from '$app/environment';

  console.log('🏗️ LAYOUT: Component loading');

	let { children } = $props();

  onMount(async () => {
    console.log('🏗️ LAYOUT: onMount called, browser =', browser);
    // Initialize Auth0 client on app load
    if (browser) {
      console.log('🏗️ LAYOUT: Initializing auth service...');
      await authService.initialize();
      console.log('🏗️ LAYOUT: Auth service initialized');
    }
  });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-dvh flex flex-col">
  <Header />
  <main class="flex-1">
    {@render children?.()}
  </main>
  <Footer />
</div>
