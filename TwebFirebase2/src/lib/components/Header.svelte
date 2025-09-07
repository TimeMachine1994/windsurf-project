<script lang="ts">
  import { user, userProfile } from '$lib/stores/auth';
  import { signOutUser } from '$lib/firebase/auth';
  import { goto } from '$app/navigation';

  async function handleSignOut() {
    try {
      await signOutUser();
      goto('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
</script>

<header class="bg-black shadow-lg border-b border-[#D5BA7F]/40">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo/Brand -->
      <div class="flex-shrink-0">
        <a href="/" class="text-xl font-bold text-white hover:text-[#D5BA7F] transition-colors duration-300">
          TributeStream
        </a>
      </div>

      <!-- Navigation -->
      <nav class="hidden md:flex space-x-8">
        <a href="/" class="text-white hover:text-[#D5BA7F] px-3 py-2 text-sm font-medium transition-colors duration-300">
          Home
        </a>
        <a href="/about" class="text-white hover:text-[#D5BA7F] px-3 py-2 text-sm font-medium transition-colors duration-300">
          About
        </a>
        <a href="/contact" class="text-white hover:text-[#D5BA7F] px-3 py-2 text-sm font-medium transition-colors duration-300">
          Contact
        </a>
      </nav>

      <!-- Auth Section -->
      <div class="flex items-center space-x-4">
        {#if $user}
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <span class="text-sm text-white">
              Hello, {$userProfile?.displayName || $user.email}
            </span>
            <a 
              href="/profile" 
              class="text-white hover:text-[#D5BA7F] px-3 py-2 text-sm font-medium transition-colors duration-300"
            >
              Profile
            </a>
            <button 
              on:click={handleSignOut}
              class="bg-[#D5BA7F] hover:bg-[#C5A96F] text-black px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-lg"
            >
              Sign Out
            </button>
          </div>
        {:else}
          <!-- Guest Menu -->
          <div class="flex items-center space-x-4">
            <a 
              href="/login" 
              class="text-white hover:text-[#D5BA7F] px-3 py-2 text-sm font-medium transition-colors duration-300"
            >
              Login
            </a>
            <a 
              href="/register" 
              class="bg-[#D5BA7F] hover:bg-[#C5A96F] text-black px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-lg"
            >
              Register
            </a>
          </div>
        {/if}
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button class="text-white hover:text-[#D5BA7F] p-2 transition-colors duration-300" aria-label="Open mobile menu">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>
