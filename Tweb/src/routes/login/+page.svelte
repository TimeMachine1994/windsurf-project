<script lang="ts">
	import LoginForm from '$lib/components/LoginForm.svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	
	// Redirect if already logged in
	$: if ($authStore.user && $authStore.initialized) {
		goto('/');
	}
</script>

<svelte:head>
	<title>Sign In - TributeStream</title>
	<meta name="description" content="Sign in to your TributeStream account to access memorial services" />
</svelte:head>

{#if !$authStore.user}
	<!-- Hero Section - Law of Proximity -->
	<section class="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-24 px-4">
		<div class="max-w-2xl mx-auto text-center">
			<h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
				Welcome Back
			</h1>
			<p class="text-xl text-primary-100 leading-relaxed">
				Sign in to access your memorial services and manage your account
			</p>
		</div>
	</section>

	<!-- Login Form Section -->
	<section class="py-20 px-4 bg-white dark:bg-surface-950">
		<div class="max-w-md mx-auto">
			<LoginForm />
		</div>
	</section>
{/if}
