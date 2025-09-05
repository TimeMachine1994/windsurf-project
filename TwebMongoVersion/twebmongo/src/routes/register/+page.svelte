<script lang="ts">
	import ViewerRegistrationForm from '$lib/components/ViewerRegistrationForm.svelte';
</script>

<svelte:head>
	<title>Create Viewer Account - TributeStream</title>
	<meta name="description" content="Create your TributeStream viewer account to access memorial services" />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
	<div class="max-w-2xl mx-auto text-center">
		<h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
			Join TributeStream
		</h1>
		<p class="text-xl text-blue-100 leading-relaxed">
			Create your viewer account to access and share in memorial experiences
		</p>
	</div>
</section>

<!-- Register Form Section -->
<section class="py-20 px-4 bg-gray-50">
	<ViewerRegistrationForm />
</section>
