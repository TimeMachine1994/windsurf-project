<script lang="ts">
	import FuneralDirectorRegistrationForm from '$lib/components/FuneralDirectorRegistrationForm.svelte';
</script>

<svelte:head>
	<title>Funeral Director Registration - TributeStream</title>
	<meta name="description" content="Register as a funeral director to access professional memorial services" />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
	<div class="max-w-2xl mx-auto text-center">
		<h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
			Funeral Director Registration
		</h1>
		<p class="text-xl text-blue-100 leading-relaxed">
			Join our network of professional funeral directors and access advanced memorial services
		</p>
	</div>
</section>

<!-- Registration Form Section -->
<section class="py-20 px-4 bg-gray-50">
	<FuneralDirectorRegistrationForm />
</section>
