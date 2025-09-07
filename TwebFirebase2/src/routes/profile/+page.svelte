<script lang="ts">
  import { onMount } from 'svelte';
  import { user, userProfile, loading } from '$lib/stores/auth';
  import { getUserProfile, updateUserProfile } from '$lib/firebase/auth';
  import { goto } from '$app/navigation';

  let saving = false;
  let error = '';
  let success = '';
  let saveTimeout: NodeJS.Timeout;

  // Form fields
  let displayName = '';
  let phone = '';
  let bio = '';

  // Redirect if not logged in
  $: if (!$loading && !$user) {
    goto('/login');
  }

  // Initialize form fields when profile loads
  $: if ($userProfile) {
    displayName = $userProfile.displayName || '';
    phone = $userProfile.phone || '';
    bio = $userProfile.bio || '';
  }

  async function autoSave() {
    if (!$user) return;

    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set a new timeout to save after 1 second of no changes
    saveTimeout = setTimeout(async () => {
      saving = true;
      error = '';

      try {
        await updateUserProfile($user.uid, {
          displayName,
          phone,
          bio
        });

        // Refresh the profile data
        const updatedProfile = await getUserProfile($user.uid);
        userProfile.set(updatedProfile);

        success = 'Profile saved automatically';
        
        // Clear success message after 2 seconds
        setTimeout(() => {
          success = '';
        }, 2000);
      } catch (err: any) {
        error = err.message;
      } finally {
        saving = false;
      }
    }, 1000);
  }

  // Auto-save when fields change
  $: if (displayName !== undefined && $userProfile) autoSave();
  $: if (phone !== undefined && $userProfile) autoSave();
  $: if (bio !== undefined && $userProfile) autoSave();
</script>

<svelte:head>
  <title>Profile - TributeStream</title>
</svelte:head>

{#if $loading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-2 text-gray-600">Loading...</p>
    </div>
  </div>
{:else if $user && $userProfile}
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow rounded-lg">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Profile</h1>
          {#if saving}
            <div class="flex items-center text-sm text-gray-600">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </div>
          {/if}
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-6">
        {#if success}
          <div class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        {/if}

        {#if error}
          <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        {/if}

        <div>
          <div class="grid grid-cols-1 gap-6">
            <!-- Display Name -->
            <div>
              <label for="displayName" class="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                bind:value={displayName}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              />
            </div>

            <!-- Email (read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={$user.email}
                disabled
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
              />
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                bind:value={phone}
                placeholder="(555) 123-4567"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              />
            </div>

            <!-- Bio -->
            <div>
              <label for="bio" class="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows="4"
                bind:value={bio}
                placeholder="Tell us about yourself..."
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              ></textarea>
            </div>

            <!-- Role (read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <input
                type="text"
                value={$userProfile.role}
                disabled
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm capitalize"
              />
            </div>

            <!-- Account Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Member Since
                </label>
                <input
                  type="text"
                  value={new Date($userProfile.createdAt).toLocaleDateString()}
                  disabled
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <input
                  type="text"
                  value={new Date($userProfile.updatedAt).toLocaleDateString()}
                  disabled
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
{/if}
