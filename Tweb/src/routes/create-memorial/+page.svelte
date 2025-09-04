<script lang="ts">
	import CreateMemorialForm from '$lib/components/CreateMemorialForm.svelte';
	import { page } from '$app/stores';

	// Get pre-filled name from URL parameter
	$: prefilledName = $page.url.searchParams.get('name') || '';
</script>

<svelte:head>
	<title>Create a Memorial - TributeStream</title>
	<meta name="description" content="Create a beautiful memorial page for your loved one with TributeStream" />
</svelte:head>

<!-- Hero Section - Law of Proximity -->
<section class="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-24 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<div class="space-y-6">
			<h1 class="text-4xl md:text-5xl font-bold leading-tight">
				Create a <span class="text-primary-200">Memorial</span>
			</h1>
			<p class="text-xl text-primary-100 leading-relaxed max-w-2xl mx-auto">
				Honor your loved one with a beautiful memorial page that celebrates their life and legacy
			</p>
		</div>
	</div>
</section>

<!-- Form Section -->
<section class="py-20 px-4 bg-white dark:bg-surface-950">
	<div class="max-w-4xl mx-auto">
		<CreateMemorialForm {prefilledName} />
	</div>
</section>
