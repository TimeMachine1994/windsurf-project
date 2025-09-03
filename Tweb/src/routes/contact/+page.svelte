<script lang="ts">
	import ContactForm from '$lib/components/ContactForm.svelte';
</script>

<style>
	.contact-page {
		min-height: 100vh;
		background: var(--color-surface);
		padding: 3rem 0;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.contact-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.contact-title {
		font-size: 3rem;
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: 1rem;
		line-height: 1.2;
	}

	.contact-subtitle {
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		max-width: 48rem;
		margin: 0 auto;
		line-height: 1.6;
	}

	.contact-info {
		max-width: 64rem;
		margin: 4rem auto 0;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.info-card {
		background: var(--color-background);
		border-radius: 0.75rem;
		box-shadow: var(--shadow-md);
		padding: 2rem;
		text-align: center;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.info-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.info-icon {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem;
	}

	.support-icon {
		background: var(--color-primary-alpha);
		color: var(--color-primary);
	}

	.guidance-icon {
		background: #10B98120;
		color: #10B981;
	}

	.care-icon {
		background: #8B5CF620;
		color: #8B5CF6;
	}

	.info-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	.info-description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 0;
	}

	@media (max-width: 768px) {
		.contact-title {
			font-size: 2.5rem;
		}

		.contact-page {
			padding: 2rem 0;
		}

		.info-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}
</style>

<svelte:head>
	<title>Contact Us - TributeStream</title>
	<meta name="description" content="Get in touch with TributeStream for questions about our memorial and livestream services. We're here to help you create lasting tributes." />
</svelte:head>

<div class="contact-page">
	<div class="container">
		<!-- Header Section -->
		<div class="contact-header">
			<h1 class="contact-title">
				Contact Us
			</h1>
			<p class="contact-subtitle">
				We're here to support you during difficult times and help you create meaningful memorial experiences.
			</p>
		</div>

		<!-- Contact Form -->
		<ContactForm />

		<!-- Additional Information -->
		<div class="contact-info">
			<div class="info-grid">
				<div class="info-card">
					<div class="info-icon support-icon">
						<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"/>
						</svg>
					</div>
					<h3 class="info-title">24/7 Support</h3>
					<p class="info-description">
						We understand that loss doesn't follow business hours. Our support team is available around the clock.
					</p>
				</div>

				<div class="info-card">
					<div class="info-icon guidance-icon">
						<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<h3 class="info-title">Expert Guidance</h3>
					<p class="info-description">
						Our experienced team will guide you through every step of creating a meaningful memorial service.
					</p>
				</div>

				<div class="info-card">
					<div class="info-icon care-icon">
						<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
						</svg>
					</div>
					<h3 class="info-title">Compassionate Care</h3>
					<p class="info-description">
						We approach every interaction with empathy, understanding, and respect for your unique situation.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
