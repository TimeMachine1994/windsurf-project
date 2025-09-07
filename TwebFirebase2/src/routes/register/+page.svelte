<script lang="ts">
  import { registerUser } from '$lib/firebase/auth';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth';

  let email = '';
  let password = '';
  let confirmPassword = '';
  let displayName = '';
  let loading = false;
  let error = '';

  // Redirect if already logged in
  $: if ($user) {
    goto('/profile');
  }

  async function handleSubmit() {
    if (!email || !password || !confirmPassword || !displayName) {
      error = 'Please fill in all fields';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }

    loading = true;
    error = '';

    try {
      await registerUser(email, password, displayName);
      goto('/profile');
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Register - TributeStream</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
          sign in to your existing account
        </a>
      </p>
    </div>

    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div class="space-y-4">
        <div>
          <label for="displayName" class="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            bind:value={displayName}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            required
            bind:value={password}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your password"
          />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            bind:value={confirmPassword}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Confirm your password"
          />
        </div>
      </div>

      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          {:else}
            Create Account
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
