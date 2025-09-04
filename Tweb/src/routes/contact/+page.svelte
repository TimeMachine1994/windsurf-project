<script lang="ts">
	import ContactForm from '$lib/components/ContactForm.svelte';
</script>


<svelte:head>
	<title>Contact Us - TributeStream</title>
	<meta name="description" content="Get in touch with TributeStream for questions about our memorial and livestream services. We're here to help you create lasting tributes." />
</svelte:head>

<!-- Hero Section - Law of Proximity & Von Restorff Effect -->
<section class="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-24 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<div class="space-y-8">
			<h1 class="text-4xl md:text-6xl font-bold leading-tight">
				We're Here to <span class="text-primary-200">Help</span>
			</h1>
			<p class="text-xl md:text-2xl text-primary-100 leading-relaxed max-w-3xl mx-auto">
				We're here to support you during difficult times and help you create meaningful memorial experiences
			</p>
		</div>
	</div>
</section>

<!-- Contact Form Section - Law of Proximity -->
<section class="py-20 px-4 bg-white dark:bg-surface-950">
	<div class="max-w-4xl mx-auto">
		<ContactForm />
	</div>
</section>

<!-- Support Information - Miller's Rule (3 key support areas) & Law of Common Region -->
<section class="bg-surface-50 dark:bg-surface-900 py-20 px-4">
	<div class="max-w-6xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
				Support When You Need It Most
			</h2>
			<p class="text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
				Our commitment to you extends beyond technology
			</p>
		</div>
		
		<div class="grid md:grid-cols-3 gap-8">
			<div class="bg-white dark:bg-surface-950 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200 border border-surface-200 dark:border-surface-700">
				<div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="text-primary-600">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"/>
					</svg>
				</div>
				<h3 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
					24/7 Support
				</h3>
				<p class="text-surface-600 dark:text-surface-400 leading-relaxed">
					We understand that loss doesn't follow business hours. Our support team is available around the clock.
				</p>
			</div>

			<div class="bg-white dark:bg-surface-950 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200 border border-surface-200 dark:border-surface-700">
				<div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="text-primary-600">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<h3 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
					Expert Guidance
				</h3>
				<p class="text-surface-600 dark:text-surface-400 leading-relaxed">
					Our experienced team will guide you through every step of creating a meaningful memorial service.
				</p>
			</div>

			<div class="bg-white dark:bg-surface-950 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200 border border-surface-200 dark:border-surface-700">
				<div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="text-primary-600">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
					</svg>
				</div>
				<h3 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
					Compassionate Care
				</h3>
				<p class="text-surface-600 dark:text-surface-400 leading-relaxed">
					We approach every interaction with empathy, understanding, and respect for your unique situation.
				</p>
			</div>
		</div>
	</div>
</section>
