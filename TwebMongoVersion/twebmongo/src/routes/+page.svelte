<script lang="ts">
  import { isAuthenticated, user } from '$lib/services/auth-mock';
  
  console.log('🏠 HOME PAGE: Component loading');
  
  // Log auth state changes
  $: {
    console.log('🏠 HOME PAGE: Auth state - isAuthenticated:', $isAuthenticated, 'user:', $user);
  }
</script>

<svelte:head>
  <title>TributeStream - Honor Their Memory</title>
</svelte:head>

<div class="bg-gradient-to-b from-blue-50 to-white min-h-screen">
  <div class="container mx-auto py-16" style="padding-left: 1rem; padding-right: 1rem;">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <h1 class="text-5xl font-bold text-gray-900 mb-6">
        Honor Their Memory
      </h1>
      <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Create beautiful, lasting memorials for your loved ones. Share memories, photos, and celebrate the lives that touched our hearts.
      </p>
      
      {#if $isAuthenticated}
        <div class="space-x-4">
          <a href="/create-memorial" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Create Memorial
          </a>
          <a href="/my-memorials" class="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            My Memorials
          </a>
        </div>
      {:else}
        <div class="space-x-4">
          <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <a href="/search" class="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            Browse Memorials
          </a>
        </div>
      {/if}
    </div>

    <!-- Features Section -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <div class="text-center p-6">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Beautiful Memorials</h3>
        <p class="text-gray-600">Create stunning tribute pages with photos, stories, and memories that celebrate their life.</p>
      </div>

      <div class="text-center p-6">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Easy Sharing</h3>
        <p class="text-gray-600">Share memorial pages with family and friends through social media or direct links.</p>
      </div>

      <div class="text-center p-6">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Private & Secure</h3>
        <p class="text-gray-600">Control who can view and contribute to memorial pages with flexible privacy settings.</p>
      </div>
    </div>

    <!-- Recent Memorials Section -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">Recent Memorials</h2>
      <p class="text-gray-600 mb-8">Discover and honor the memories shared by our community</p>
      <a href="/search" class="text-blue-600 hover:text-blue-800 font-semibold">
        Browse All Memorials →
      </a>
    </div>
  </div>
</div>
