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
	<title>Sign In - Your App</title>
	<meta name="description" content="Sign in to your account" />
</svelte:head>

{#if !$authStore.user}
	<LoginForm />
{/if}
