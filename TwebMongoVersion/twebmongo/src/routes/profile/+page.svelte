<script lang="ts">
  import { onMount } from 'svelte';
  import { user, isAuthenticated } from '$lib/services/auth-mock';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  console.log('🔍 PROFILE PAGE: Script loading');

  interface UserProfile {
    userId: string;
    email: string;
    name: string;
    picture?: string;
    createdAt: Date;
    updatedAt: Date;
    memorialCount?: number;
    photoCount?: number;
  }

  let profile: UserProfile | null = null;
  let loading = true;
  let error = '';
  let editing = false;
  let editForm = {
    name: '',
    email: ''
  };

  onMount(async () => {
    console.log('🔍 PROFILE PAGE: onMount called');
    console.log('🔍 PROFILE PAGE: browser =', browser);
    console.log('🔍 PROFILE PAGE: $isAuthenticated =', $isAuthenticated);
    console.log('🔍 PROFILE PAGE: $user =', $user);

    if (!browser) {
      console.log('🔍 PROFILE PAGE: Not in browser, skipping');
      return;
    }

    if (!$isAuthenticated) {
      console.log('🔍 PROFILE PAGE: Not authenticated, redirecting to home');
      goto('/');
      return;
    }

    console.log('🔍 PROFILE PAGE: Loading profile...');
    await loadProfile();
  });

  async function loadProfile() {
    console.log('🔍 PROFILE PAGE: loadProfile() called');
    try {
      loading = true;
      console.log('🔍 PROFILE PAGE: Making fetch request to /api/user/profile');
      const response = await fetch('/api/user/profile');
      console.log('🔍 PROFILE PAGE: Response received:', response.status, response.statusText);
      
      if (response.ok) {
        console.log('🔍 PROFILE PAGE: Response OK, parsing JSON...');
        profile = await response.json();
        console.log('🔍 PROFILE PAGE: Profile data:', profile);
        if (profile) {
          editForm.name = profile.name;
          editForm.email = profile.email;
          console.log('🔍 PROFILE PAGE: Edit form populated');
        }
      } else {
        console.log('🔍 PROFILE PAGE: Response not OK');
        const errorText = await response.text();
        console.log('🔍 PROFILE PAGE: Error response body:', errorText);
        error = 'Failed to load profile';
      }
    } catch (err) {
      console.error('🔍 PROFILE PAGE: Profile load error:', err);
      error = 'Network error loading profile';
    } finally {
      loading = false;
      console.log('🔍 PROFILE PAGE: loadProfile() finished, loading =', loading);
    }
  }

  async function saveProfile() {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        await loadProfile();
        editing = false;
      } else {
        const result = await response.json();
        error = result.error || 'Failed to update profile';
      }
    } catch (err) {
      console.error('Profile save error:', err);
      error = 'Network error saving profile';
    }
  }

  function startEditing() {
    editing = true;
    error = '';
  }

  function cancelEditing() {
    editing = false;
    if (profile) {
      editForm.name = profile.name;
      editForm.email = profile.email;
    }
    error = '';
  }

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>My Profile - TributeStream</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-8" style="padding-left: 1rem; padding-right: 1rem;">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
    <p class="text-gray-600 mt-2">Manage your account information and view your activity</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="card bg-red-50 border-red-200">
      <p class="text-red-700">❌ {error}</p>
      <button on:click={loadProfile} class="btn btn-primary mt-4">Try Again</button>
    </div>
  {:else if profile}
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Profile Information -->
      <div class="lg:col-span-2">
        <div class="card">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">Profile Information</h2>
            {#if !editing}
              <button on:click={startEditing} class="btn btn-secondary">
                ✏️ Edit Profile
              </button>
            {/if}
          </div>

          {#if editing}
            <form on:submit|preventDefault={saveProfile} class="space-y-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  bind:value={editForm.name}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  bind:value={editForm.email}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p class="text-sm text-gray-500 mt-1">
                  Email changes may require verification
                </p>
              </div>

              <div class="flex gap-3">
                <button type="submit" class="btn btn-primary">
                  💾 Save Changes
                </button>
                <button type="button" on:click={cancelEditing} class="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          {:else}
            <div class="space-y-6">
              <div class="flex items-center gap-4">
                {#if profile.picture}
                  <img
                    src={profile.picture}
                    alt="Profile"
                    class="w-16 h-16 rounded-full object-cover"
                  />
                {:else}
                  <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-2xl">👤</span>
                  </div>
                {/if}
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">{profile.name}</h3>
                  <p class="text-gray-600">{profile.email}</p>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <span class="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </span>
                  <p class="text-gray-900">{formatDate(profile.createdAt)}</p>
                </div>
                <div>
                  <span class="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </span>
                  <p class="text-gray-900">{formatDate(profile.updatedAt)}</p>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Activity Summary -->
      <div class="space-y-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Memorials Created</span>
              <span class="text-2xl font-bold text-blue-600">
                {profile.memorialCount || 0}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Photos Uploaded</span>
              <span class="text-2xl font-bold text-green-600">
                {profile.photoCount || 0}
              </span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <a href="/create-memorial" class="btn btn-primary w-full">
              ➕ Create New Memorial
            </a>
            <a href="/my-memorials" class="btn btn-secondary w-full">
              📋 View My Memorials
            </a>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div class="space-y-3">
            <button class="btn btn-outline w-full text-left">
              🔔 Notification Preferences
            </button>
            <button class="btn btn-outline w-full text-left">
              🔒 Privacy Settings
            </button>
            <button class="btn btn-outline w-full text-left text-red-600">
              🗑️ Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: background-color 0.2s;
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

  .btn-outline {
    border: 1px solid #d1d5db;
    color: #374151;
  }
  
  .btn-outline:hover {
    background-color: #f9fafb;
  }

  .card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    padding: 1.5rem;
  }
</style>
