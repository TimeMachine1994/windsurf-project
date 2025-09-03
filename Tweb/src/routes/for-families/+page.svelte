<!-- Hero Section -->
<section class="hero">
	<div class="container">
		<div class="hero-content">
			<h1 class="hero-title">Be Together, No Matter the Distance.</h1>
			<p class="hero-subtitle">
				Honor a loved one and find comfort, even when you can't be there in person.
			</p>
			<div class="hero-buttons">
				<a href="/packages" class="btn btn-primary">View Packages</a>
				<a href="/contact" class="btn btn-secondary">Get Support</a>
			</div>
		</div>
	</div>
</section>

<!-- Main Content -->
<section class="main-content">
	<div class="container">
		<div class="content-text">
			<p class="lead-text">
				Saying goodbye is one of life's most difficult moments, and it's even harder when you can't be with your family to share in the experience. Tributestream was created to solve this problem, providing a way for anyone to attend a funeral or memorial service, regardless of time, space, or circumstance.
			</p>
			
			<p>
				Our services are designed to be a powerful tool for grief and healing. By providing a live connection and a permanent recording, we ensure that you can be present for the service and revisit it later to find peace at your own pace. Our videographers and technicians are on-site to ensure a seamless, professional experience from start to finish.
			</p>
		</div>
	</div>
</section>

<!-- Value Section -->
<section class="value">
	<div class="container">
		<h2 class="section-title">The Value We Deliver</h2>
		<div class="value-grid">
			<div class="value-card">
				<div class="value-icon">🎞️</div>
				<h3>Timeless Keepsake</h3>
				<p>Capture speeches and moments to be remembered forever. We provide a complimentary download of the original video and a complimentary USB box and hosting for a year.</p>
			</div>
			
			<div class="value-card">
				<div class="value-icon">🌐</div>
				<h3>Connect Your Community</h3>
				<p>Our custom link is easily shareable and accessible on any device, allowing loved ones across the world to join the service. Shared links tend to get an average of 60-80 viewers.</p>
			</div>
			
			<div class="value-card">
				<div class="value-icon">📞</div>
				<h3>A Single Point of Support</h3>
				<p>We are a one-stop-shop that can coordinate additional services like photographers, musicians, or sound systems, so you only have to make one call.</p>
			</div>
		</div>
	</div>
</section>

<!-- Promise Section -->
<section class="promise">
	<div class="container">
		<div class="promise-content">
			<h2>Our Promise</h2>
			<p class="promise-text">
				Our promise is simple: to honor your loved one using technology and ensure everyone has the opportunity to properly grieve and heal.
			</p>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="cta-section">
	<div class="container">
		<div class="cta-content">
			<h2>Ready to Connect Your Family?</h2>
			<p>Let us help you bring everyone together to honor your loved one with dignity and respect.</p>
			<div class="cta-buttons">
				<a href="/contact" class="btn btn-primary">Get Started</a>
				<a href="/packages" class="btn btn-outline">View Our Packages</a>
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: white;
		padding: 4rem 0 6rem;
		text-align: center;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		line-height: 1.1;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		margin-bottom: 2rem;
		opacity: 0.95;
		line-height: 1.6;
	}

	.hero-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.main-content {
		padding: 4rem 0;
		background: var(--color-background);
	}

	.content-text {
		max-width: 800px;
		margin: 0 auto;
	}

	.lead-text {
		font-size: 1.125rem;
		line-height: 1.7;
		margin-bottom: 1.5rem;
		color: var(--color-text);
	}

	.value {
		padding: 4rem 0;
		background: var(--color-surface);
	}

	.section-title {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
		color: var(--color-text);
	}

	.value-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.value-card {
		background: var(--color-background);
		padding: 2rem;
		border-radius: 1rem;
		text-align: center;
		box-shadow: var(--shadow-md);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.value-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.value-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.value-card h3 {
		color: var(--color-text);
		margin-bottom: 1rem;
		font-size: 1.25rem;
	}

	.value-card p {
		color: var(--color-text-secondary);
		line-height: 1.6;
	}

	.promise {
		padding: 4rem 0;
		background: var(--color-background);
	}

	.promise-content {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.promise-content h2 {
		font-size: 2rem;
		margin-bottom: 1.5rem;
		color: var(--color-text);
	}

	.promise-text {
		font-size: 1.125rem;
		line-height: 1.7;
		color: var(--color-text-secondary);
	}

	.cta-section {
		padding: 4rem 0;
		background: var(--color-surface);
		text-align: center;
	}

	.cta-content {
		max-width: 600px;
		margin: 0 auto;
	}

	.cta-content h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: var(--color-text);
	}

	.cta-content p {
		font-size: 1.125rem;
		margin-bottom: 2rem;
		color: var(--color-text-secondary);
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}
		
		.hero-subtitle {
			font-size: 1.125rem;
		}
		
		.hero-buttons,
		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}
		
		.value-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
