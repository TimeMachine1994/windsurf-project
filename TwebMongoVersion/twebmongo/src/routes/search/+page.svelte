<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import type { MemorialDoc } from '$lib/types';

  let searchQuery = '';
  let memorials: MemorialDoc[] = [];
  let loading = false;
  let error = '';
  let hasSearched = false;

  onMount(() => {
    // Get search query from URL params if present
    const urlQuery = $page.url.searchParams.get('q');
    if (urlQuery) {
      searchQuery = urlQuery;
      performSearch();
    }
  });

  async function performSearch() {
    if (!searchQuery.trim()) return;

    try {
      loading = true;
      hasSearched = true;
      error = '';

      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const result = await response.json();

      if (result.success) {
        memorials = result.memorials || [];
      } else {
        error = result.error || 'Search failed';
      }
    } catch (err) {
      console.error('Search error:', err);
      error = 'Network error during search';
    } finally {
      loading = false;
    }
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    performSearch();
  }

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getMemorialUrl(slug: string) {
    return `/memorial/${slug}`;
  }
</script>

<svelte:head>
  <title>Search Memorials - TributeStream</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-8" style="padding-left: 1rem; padding-right: 1rem;">
  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-4">Search Memorials</h1>
    <p class="text-gray-600">Find memorials by name, biography, or other details</p>
  </div>

  <!-- Search Form -->
  <form on:submit={handleSubmit} class="mb-8">
    <div class="flex gap-3">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search for a memorial..."
        class="flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" style="padding: 0.75rem 1rem;"
        required
      />
      <button
        type="submit"
        disabled={loading}
        class="bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" style="padding: 0.75rem 1.5rem;"
      >
        {#if loading}
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        {:else}
          <span>🔍</span>
        {/if}
        <span>Search</span>
      </button>
    </div>
  </form>

  <!-- Results -->
  {#if loading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Searching memorials...</p>
    </div>
  {:else if error}
    <div class="card bg-red-50 border-red-200">
      <p class="text-red-700">❌ {error}</p>
    </div>
  {:else if hasSearched}
    {#if memorials.length === 0}
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">No Results Found</h2>
        <p class="text-gray-600 mb-6">
          No memorials found for "{searchQuery}". Try different keywords or check the spelling.
        </p>
        <p class="text-sm text-gray-500">
          Search includes memorial names, biographies, and other details.
        </p>
      </div>
    {:else}
      <div class="mb-6">
        <p class="text-gray-600">
          Found {memorials.length} memorial{memorials.length !== 1 ? 's' : ''} for "{searchQuery}"
        </p>
      </div>

      <div class="space-y-6">
        {#each memorials as memorial (memorial._id)}
          <div class="card hover:shadow-lg transition-shadow duration-200">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <h3 class="text-xl font-semibold text-gray-900">
                    <a href={getMemorialUrl(memorial.slug)} class="hover:text-blue-600 transition-colors">
                      {memorial.lovedOneName}
                    </a>
                  </h3>
                  <span class="text-xs rounded-full bg-blue-100 text-blue-800" style="padding: 0.25rem 0.5rem;">
                    Public
                  </span>
                </div>

                {#if memorial.dateOfBirth || memorial.dateOfPassing}
                  <p class="text-gray-600 mb-3">
                    {#if memorial.dateOfBirth}
                      {formatDate(memorial.dateOfBirth)}
                    {/if}
                    {#if memorial.dateOfBirth && memorial.dateOfPassing} - {/if}
                    {#if memorial.dateOfPassing}
                      {formatDate(memorial.dateOfPassing)}
                    {/if}
                  </p>
                {/if}

                {#if memorial.biography}
                  <p class="text-gray-700 mb-4 line-clamp-3">
                    {memorial.biography.substring(0, 200)}{memorial.biography.length > 200 ? '...' : ''}
                  </p>
                {/if}

                <div class="flex items-center gap-6 text-sm text-gray-500">
                  <span>👁️ {memorial.viewCount} views</span>
                  <span>📅 Created {formatDate(memorial.createdAt)}</span>
                  <span>👤 By {memorial.creatorName}</span>
                </div>
              </div>

              <div class="ml-6">
                <a href={getMemorialUrl(memorial.slug)} class="btn btn-primary">
                  View Memorial
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {:else}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">🔍</div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Start Your Search</h2>
      <p class="text-gray-600">
        Enter a name or keyword to search through public memorials.
      </p>
    </div>
  {/if}
</div>

<style>
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: background-color 0.2s;
    text-align: center;
  }

  .btn-primary {
    background-color: #2563eb;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #1d4ed8;
  }

  .card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    padding: 1.5rem;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
