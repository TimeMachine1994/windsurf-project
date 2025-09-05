<script lang="ts">
  import { onMount } from 'svelte';
  import { user, isAuthenticated } from '$lib/services/auth-mock';
  import { goto } from '$app/navigation';
  import type { MemorialDoc } from '$lib/types';
  import { browser } from '$app/environment';

  console.log('📋 MY MEMORIALS: Script loading');

  let memorials: MemorialDoc[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    console.log('📋 MY MEMORIALS: onMount called');
    console.log('📋 MY MEMORIALS: browser =', browser);
    console.log('📋 MY MEMORIALS: $isAuthenticated =', $isAuthenticated);
    console.log('📋 MY MEMORIALS: $user =', $user);

    if (!browser) {
      console.log('📋 MY MEMORIALS: Not in browser, skipping');
      return;
    }

    if (!$isAuthenticated) {
      console.log('📋 MY MEMORIALS: Not authenticated, redirecting to home');
      goto('/');
      return;
    }

    console.log('📋 MY MEMORIALS: User authenticated, loading memorials...');
    await loadMemorials();
  });

  async function loadMemorials() {
    console.log('📋 MY MEMORIALS: loadMemorials() called');
    try {
      loading = true;
      console.log('📋 MY MEMORIALS: Making fetch request to /api/user/memorials');
      const response = await fetch('/api/user/memorials');
      console.log('📋 MY MEMORIALS: Response received:', response.status, response.statusText);
      
      if (response.ok) {
        console.log('📋 MY MEMORIALS: Response OK, parsing JSON...');
        const result = await response.json();
        console.log('📋 MY MEMORIALS: Memorials data:', result);
        memorials = result.memorials || [];
        console.log('📋 MY MEMORIALS: Loaded', memorials.length, 'memorials');
      } else {
        console.log('📋 MY MEMORIALS: Response not OK');
        const errorText = await response.text();
        console.log('📋 MY MEMORIALS: Error response body:', errorText);
        error = 'Failed to load memorials';
      }
    } catch (err) {
      console.error('📋 MY MEMORIALS: Network error:', err);
      error = 'Network error loading memorials';
    } finally {
      loading = false;
      console.log('📋 MY MEMORIALS: loadMemorials() finished, loading =', loading);
    }
  }

  async function deleteMemorial(memorial: MemorialDoc) {
    if (!confirm(`Are you sure you want to delete the memorial for ${memorial.lovedOneName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/memorials/${memorial.slug}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        memorials = memorials.filter(m => m._id !== memorial._id);
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to delete memorial');
      }
    } catch (err) {
      console.error('Memorial deletion error:', err);
      alert('Network error deleting memorial');
    }
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
  <title>My Memorials - TributeStream</title>
</svelte:head>

<div class="max-w-6xl mx-auto py-8" style="padding-left: 1rem; padding-right: 1rem;">
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">My Memorials</h1>
      <p class="text-gray-600 mt-2">Manage the memorials you've created</p>
    </div>
    <a href="/create-memorial" class="btn btn-primary">
      ➕ Create New Memorial
    </a>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="card bg-red-50 border-red-200">
      <p class="text-red-700">❌ {error}</p>
      <button on:click={loadMemorials} class="btn btn-primary mt-4">Try Again</button>
    </div>
  {:else if memorials.length === 0}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">🕊️</div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">No Memorials Yet</h2>
      <p class="text-gray-600 mb-6">You haven't created any memorials yet. Create your first memorial to honor a loved one.</p>
      <a href="/create-memorial" class="btn btn-primary">
        Create Your First Memorial
      </a>
    </div>
  {:else}
    <div class="grid gap-6">
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
                <span class="px-2 py-1 text-xs rounded-full {memorial.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                  {memorial.isPublic ? 'Public' : 'Private'}
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
                <span>🔗 /{memorial.slug}</span>
              </div>
            </div>

            <div class="flex flex-col gap-2 ml-6">
              <a href={getMemorialUrl(memorial.slug)} class="btn btn-primary text-sm">
                👁️ View
              </a>
              <a href={`${getMemorialUrl(memorial.slug)}#photos`} class="btn btn-secondary text-sm">
                📷 Photos
              </a>
              <button 
                on:click={() => deleteMemorial(memorial)}
                class="btn btn-danger text-sm"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-8 text-center">
      <p class="text-gray-600">
        Showing {memorials.length} memorial{memorials.length !== 1 ? 's' : ''}
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

  .btn-secondary {
    background-color: #e5e7eb;
    color: #1f2937;
  }
  
  .btn-secondary:hover {
    background-color: #d1d5db;
  }

  .btn-danger {
    background-color: #dc2626;
    color: white;
  }
  
  .btn-danger:hover {
    background-color: #b91c1c;
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
    line-clamp: 3;
  }
</style>
