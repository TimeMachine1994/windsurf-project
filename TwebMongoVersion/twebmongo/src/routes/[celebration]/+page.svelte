<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	let memorial: any = null;
	let loading = true;
	let error = '';
	
	onMount(async () => {
		const slug = $page.params.celebration;
		
		// Check if this is a celebration-of-life URL
		if (!slug.startsWith('celebration-of-life-for-')) {
			// Not a memorial URL, redirect to 404
			goto('/404', { replaceState: true });
			return;
		}
		
		try {
			const response = await fetch(`/api/memorials/by-url/${encodeURIComponent(slug)}`);
			
			if (response.ok) {
				memorial = await response.json();
			} else if (response.status === 404) {
				error = 'Memorial not found';
			} else {
				error = 'Failed to load memorial';
			}
		} catch (err) {
			error = 'Failed to load memorial';
			console.error('Error loading memorial:', err);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	{#if memorial}
		<title>Celebrating the Life of {memorial.lovedOneName} - TributeStream</title>
		<meta name="description" content="A memorial celebrating the life of {memorial.lovedOneName}. Share memories, photos, and honor their legacy." />
	{:else}
		<title>Memorial - TributeStream</title>
	{/if}
</svelte:head>

{#if loading}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
			<p class="text-gray-600">Loading memorial...</p>
		</div>
	</div>
{:else if error}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Memorial Not Found</h1>
			<p class="text-gray-600 mb-8">{error}</p>
			<a href="/" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
				Return Home
			</a>
		</div>
	</div>
{:else if memorial}
	<!-- Memorial Header -->
	<section class="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20 px-4">
		<div class="max-w-4xl mx-auto text-center">
			<h1 class="text-4xl md:text-6xl font-bold mb-4">
				{memorial.lovedOneName}
			</h1>
			{#if memorial.dateOfBirth || memorial.dateOfPassing}
				<div class="text-xl md:text-2xl text-gray-200 mb-6">
					{#if memorial.dateOfBirth}
						{new Date(memorial.dateOfBirth).toLocaleDateString('en-US', { 
							year: 'numeric', 
							month: 'long', 
							day: 'numeric' 
						})}
					{/if}
					{#if memorial.dateOfBirth && memorial.dateOfPassing} - {/if}
					{#if memorial.dateOfPassing}
						{new Date(memorial.dateOfPassing).toLocaleDateString('en-US', { 
							year: 'numeric', 
							month: 'long', 
							day: 'numeric' 
						})}
					{/if}
				</div>
			{/if}
			<p class="text-lg text-gray-300">
				Celebrating a life well lived
			</p>
		</div>
	</section>

	<!-- Memorial Content -->
	<section class="py-16 px-4">
		<div class="max-w-4xl mx-auto">
			{#if memorial.biography}
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-6">Life Story</h2>
					<div class="prose prose-lg max-w-none text-gray-700">
						{@html memorial.biography.replace(/\n/g, '<br>')}
					</div>
				</div>
			{/if}

			<!-- Photo Gallery Placeholder -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
				{#if memorial.photoCount > 0}
					<p class="text-gray-600">
						This memorial has {memorial.photoCount} photo{memorial.photoCount !== 1 ? 's' : ''}.
					</p>
					<!-- Photo gallery component would go here -->
				{:else}
					<p class="text-gray-600">
						No photos have been added to this memorial yet.
					</p>
				{/if}
			</div>

			<!-- Guest Book Placeholder -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">Guest Book</h2>
				<p class="text-gray-600">
					Share your memories and condolences with the family.
				</p>
				<!-- Guest book component would go here -->
			</div>
		</div>
	</section>

	<!-- Memorial Info -->
	<section class="py-16 px-4 bg-gray-50">
		<div class="max-w-4xl mx-auto text-center">
			<p class="text-gray-600 mb-4">
				This memorial was created by {memorial.creatorName}
			</p>
			<p class="text-sm text-gray-500">
				Memorial created on {new Date(memorial.createdAt).toLocaleDateString('en-US', { 
					year: 'numeric', 
					month: 'long', 
					day: 'numeric' 
				})}
			</p>
			{#if memorial.viewCount > 0}
				<p class="text-sm text-gray-500 mt-2">
					Visited {memorial.viewCount} time{memorial.viewCount !== 1 ? 's' : ''}
				</p>
			{/if}
		</div>
	</section>
{/if}
