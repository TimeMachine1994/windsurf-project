<script lang="ts">
	import FuneralDirectorRegistrationForm from '$lib/components/FuneralDirectorRegistrationForm.svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	
	// Redirect if already logged in
	$: if ($authStore.user && $authStore.initialized) {
		goto('/');
	}
</script>

<svelte:head>
	<title>Funeral Director Registration - TributeStream</title>
	<meta name="description" content="Register as a funeral director to access professional memorial services" />
</svelte:head>

{#if !$authStore.user}
	<!-- Hero Section -->
	<section class="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-24 px-4">
		<div class="max-w-2xl mx-auto text-center">
			<h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
				Funeral Director Registration
			</h1>
			<p class="text-xl text-primary-100 leading-relaxed">
				Join our network of professional funeral directors and access advanced memorial services
			</p>
		</div>
	</section>

	<!-- Registration Form Section -->
	<section class="py-20 px-4 bg-white dark:bg-surface-950">
		<div class="max-w-2xl mx-auto">
			<FuneralDirectorRegistrationForm />
		</div>
	</section>
{/if}
