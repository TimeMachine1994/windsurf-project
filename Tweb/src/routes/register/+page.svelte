<script lang="ts">
	import RegisterForm from '$lib/components/RegisterForm.svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	
	// Redirect if already logged in
	$: if ($authStore.user && $authStore.initialized) {
		goto('/');
	}
</script>

<svelte:head>
	<title>Register - Your App</title>
	<meta name="description" content="Create a new account" />
</svelte:head>

{#if !$authStore.user}
	<RegisterForm />
{/if}
