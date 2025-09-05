<script lang="ts">
  import { page } from '$app/stores';
  import { dev } from '$app/environment';

  $: status = $page.status;
  $: message = $page.error?.message;
</script>

<svelte:head>
  <title>{status} - TributeStream</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center" style="padding-left: 1rem; padding-right: 1rem;">
  <div class="max-w-md w-full text-center">
    <div class="text-8xl mb-6">
      {#if status === 404}
        🔍
      {:else if status >= 500}
        ⚠️
      {:else}
        ❌
      {/if}
    </div>
    
    <h1 class="text-4xl font-bold text-gray-900 mb-4">
      {#if status === 404}
        Page Not Found
      {:else if status >= 500}
        Server Error
      {:else}
        Error {status}
      {/if}
    </h1>
    
    <p class="text-gray-600 mb-8">
      {#if status === 404}
        The page you're looking for doesn't exist or has been moved.
      {:else if status >= 500}
        Something went wrong on our end. Please try again later.
      {:else if message}
        {message}
      {:else}
        An unexpected error occurred.
      {/if}
    </p>

    {#if dev && message}
      <details class="mb-8 text-left">
        <summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          Technical Details
        </summary>
        <pre class="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">{message}</pre>
      </details>
    {/if}
    
    <div class="space-y-3">
      <a href="/" class="block w-full rounded-lg transition-colors" style="padding-left: 1.5rem; padding-right: 1.5rem; padding-top: 0.75rem; padding-bottom: 0.75rem; background-color: rgb(37 99 235); color: rgb(255 255 255);">
        🏠 Return Home
      </a>
      
      <button 
        on:click={() => history.back()} 
        class="block w-full rounded-lg transition-colors" style="padding-left: 1.5rem; padding-right: 1.5rem; padding-top: 0.75rem; padding-bottom: 0.75rem; border: 1px solid rgb(209 213 219); color: rgb(55 65 81);"
      >
        ← Go Back
      </button>
    </div>
  </div>
</div>
