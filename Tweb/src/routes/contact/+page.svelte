<script lang="ts">
	import ContactForm from '$lib/components/ContactForm.svelte';
</script>

<svelte:head>
	<title>Contact Us - TributeStream</title>
	<meta name="description" content="Get in touch with TributeStream for questions about our memorial and livestream services. We're here to help you create lasting tributes." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
	<div class="container mx-auto px-4">
		<!-- Header Section -->
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
				Contact Us
			</h1>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				We're here to support you during difficult times and help you create meaningful memorial experiences.
			</p>
		</div>

		<!-- Contact Form -->
		<ContactForm />

		<!-- Additional Information -->
		<div class="max-w-4xl mx-auto mt-16">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="bg-white rounded-lg shadow-md p-6 text-center">
					<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
					<p class="text-gray-600 text-sm">
						We understand that loss doesn't follow business hours. Our support team is available around the clock.
					</p>
				</div>

				<div class="bg-white rounded-lg shadow-md p-6 text-center">
					<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Expert Guidance</h3>
					<p class="text-gray-600 text-sm">
						Our experienced team will guide you through every step of creating a meaningful memorial service.
					</p>
				</div>

				<div class="bg-white rounded-lg shadow-md p-6 text-center">
					<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Compassionate Care</h3>
					<p class="text-gray-600 text-sm">
						We approach every interaction with empathy, understanding, and respect for your unique situation.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
