<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { user } from '$lib/services/auth-mock';
  import type { MemorialDoc } from '$lib/types';
  import PhotoUploader from '$lib/components/PhotoUploader.svelte';
  import PhotoGallery from '$lib/components/PhotoGallery.svelte';
  import ShareMemorial from '$lib/components/ShareMemorial.svelte';
  import { browser } from '$app/environment';

  console.log('🏛️ MEMORIAL PAGE: Script loading');

  let memorial: MemorialDoc | null = null;
  let loading = true;
  let error = '';
  let showUploader = false;

  $: canManage = memorial && $user && memorial.creatorId === $user.sub;

  onMount(async () => {
    console.log('🏛️ MEMORIAL PAGE: onMount called');
    console.log('🏛️ MEMORIAL PAGE: browser =', browser);
    console.log('🏛️ MEMORIAL PAGE: page.params =', $page.params);
    console.log('🏛️ MEMORIAL PAGE: slug =', $page.params.slug);

    if (!browser) {
      console.log('🏛️ MEMORIAL PAGE: Not in browser, skipping');
      return;
    }

    try {
      console.log('🏛️ MEMORIAL PAGE: Attempting to load memorial...');
      const slug = $page.params.slug;
      console.log('🏛️ MEMORIAL PAGE: Making fetch request to /api/memorials/' + slug);
      
      const response = await fetch(`/api/memorials/${slug}`);
      console.log('🏛️ MEMORIAL PAGE: Response received:', response.status, response.statusText);
      
      if (response.ok) {
        console.log('🏛️ MEMORIAL PAGE: Response OK, parsing JSON...');
        memorial = await response.json();
        console.log('🏛️ MEMORIAL PAGE: Memorial data:', memorial);
      } else {
        console.log('🏛️ MEMORIAL PAGE: Response not OK');
        const errorText = await response.text();
        console.log('🏛️ MEMORIAL PAGE: Error response body:', errorText);
        error = 'Memorial not found';
      }
    } catch (e) {
      console.error('🏛️ MEMORIAL PAGE: Error loading memorial:', e);
      error = 'Failed to load memorial';
    } finally {
      loading = false;
      console.log('🏛️ MEMORIAL PAGE: onMount finished, loading =', loading, 'error =', error);
    }
  });

  function handlePhotoUploaded(event: CustomEvent) {
    // Refresh photo gallery after upload
    showUploader = false;
    // The PhotoGallery component will automatically reload
  }

  function handleUploadError(event: CustomEvent) {
    alert(`Upload error: ${event.detail.message}`);
  }

  function formatDate(date: string | Date | undefined) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>{memorial?.lovedOneName || 'Memorial'} - TributeStream</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-96">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
{:else if error}
  <div class="max-w-2xl mx-auto py-8" style="padding-left: 1rem; padding-right: 1rem;">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Memorial Not Found</h1>
      <p class="text-gray-600 mb-6">{error}</p>
      <a href="/" class="btn btn-primary">Return Home</a>
    </div>
  </div>
{:else if memorial}
  <div class="max-w-4xl mx-auto py-8" style="padding-left: 1rem; padding-right: 1rem;">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">{memorial.lovedOneName}</h1>
      {#if memorial.dateOfBirth || memorial.dateOfPassing}
        <p class="text-xl text-gray-600 mb-4">
          {#if memorial.dateOfBirth}
            {formatDate(memorial.dateOfBirth)}
          {/if}
          {#if memorial.dateOfBirth && memorial.dateOfPassing} - {/if}
          {#if memorial.dateOfPassing}
            {formatDate(memorial.dateOfPassing)}
          {/if}
        </p>
      {/if}
      
      <!-- Share Button -->
      <div class="flex justify-center">
        <ShareMemorial
          memorialName={memorial.lovedOneName}
          memorialUrl={memorial.slug}
          description={memorial.biography ? memorial.biography.substring(0, 100) + '...' : ''}
        />
      </div>
    </div>

    <!-- Biography -->
    {#if memorial.biography}
      <div class="card mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">About {memorial.lovedOneName}</h2>
        <div class="prose max-w-none">
          {#each memorial.biography.split('\n') as paragraph}
            {#if paragraph.trim()}
              <p class="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>
            {/if}
          {/each}
        </div>
      </div>
    {/if}

    <!-- Photo Gallery -->
    <div class="card mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-gray-900">Photo Gallery</h2>
        {#if canManage}
          <button
            on:click={() => showUploader = !showUploader}
            class="btn btn-primary"
          >
            {showUploader ? 'Hide Uploader' : 'Add Photos'}
          </button>
        {/if}
      </div>

      {#if showUploader && canManage}
        <div class="mb-6">
          <PhotoUploader
            memorialId={memorial._id}
            on:uploaded={handlePhotoUploaded}
            on:error={handleUploadError}
          />
        </div>
      {/if}

      <PhotoGallery
        memorialId={memorial._id}
        canManage={canManage}
      />
    </div>

    <!-- Memorial Info -->
    <div class="card">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Memorial Information</h2>
      <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <span class="font-medium">Created by:</span> {memorial.creatorName}
        </div>
        <div>
          <span class="font-medium">Created on:</span> {formatDate(memorial.createdAt)}
        </div>
        <div>
          <span class="font-medium">Views:</span> {memorial.viewCount}
        </div>
        <div>
          <span class="font-medium">Privacy:</span> {memorial.isPublic ? 'Public' : 'Private'}
        </div>
      </div>
    </div>
  </div>
{/if}
