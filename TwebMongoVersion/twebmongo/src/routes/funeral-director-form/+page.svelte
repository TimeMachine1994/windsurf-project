<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authService, user, isAuthenticated } from '$lib/services/auth-mock';
	import FuneralDirectorMemorialForm from '$lib/components/FuneralDirectorMemorialForm.svelte';

	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			await authService.loadUser();
			
			// Check if user is logged in and is a funeral director
			if (!$isAuthenticated) {
				error = 'Please log in to access this form';
				setTimeout(() => goto('/'), 3000);
				return;
			}

			if (!$user || $user.role !== 'FuneralDirector') {
				error = 'This form is only available to approved funeral directors';
				setTimeout(() => goto('/'), 3000);
				return;
			}

			if (!$user.approved) {
				error = 'Your funeral director account is pending approval';
				setTimeout(() => goto('/'), 3000);
				return;
			}

		} catch (err) {
			console.error('Auth check error:', err);
			error = 'Authentication error';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Funeral Director Memorial Form - TributeStream</title>
	<meta name="description" content="Create memorials for families as an approved funeral director with enhanced service options." />
</svelte:head>

{#if loading}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
			<p class="text-gray-600">Verifying access...</p>
		</div>
	</div>
{:else if error}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Access Restricted</h1>
			<p class="text-gray-600 mb-8">{error}</p>
			<p class="text-sm text-gray-500">Redirecting you to the home page...</p>
		</div>
	</div>
{:else}
	<!-- Hero Section -->
	<section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
		<div class="max-w-4xl mx-auto text-center">
			<h1 class="text-4xl md:text-5xl font-bold mb-4">
				Create Memorial for Family
			</h1>
			<p class="text-xl text-blue-100 mb-6">
				Professional memorial creation with enhanced service options
			</p>
			{#if $user}
				<p class="text-blue-200">
					Welcome, {$user.displayName || $user.name} from {$user.funeralHomeName}
				</p>
			{/if}
		</div>
	</section>

	<!-- Form Section -->
	<section class="py-16 px-4">
		<div class="max-w-4xl mx-auto">
			<FuneralDirectorMemorialForm />
		</div>
	</section>
{/if}
