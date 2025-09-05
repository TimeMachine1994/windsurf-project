<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth-mock';
  import { browser } from '$app/environment';

  let error = '';

  onMount(async () => {
    if (!browser) return;
    
    try {
      console.log('Initializing Auth0 client...');
      await authService.initialize();
      console.log('Starting Auth0 callback handling...');
      await authService.handleCallback();
      console.log('Auth0 callback successful, redirecting...');
      // Small delay to ensure state is updated
      setTimeout(() => {
        window.location.replace('/');
      }, 100);
    } catch (e: any) {
      console.error('Auth callback failed:', e);
      error = `Auth callback failed: ${e?.message || 'Unknown error'}`;
      // Still redirect after showing error briefly
      setTimeout(() => window.location.replace('/'), 3000);
    }
  });
</script>

<div class="flex items-center justify-center min-h-dvh">
  <div class="text-center">
    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 rounded mb-4" style="padding: 0.75rem 1rem;">
        <p class="font-bold">Authentication Error</p>
        <p class="text-sm">{error}</p>
        <p class="text-xs mt-2">Redirecting to home page...</p>
      </div>
    {:else}
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Completing authentication...</p>
    {/if}
  </div>
</div>
