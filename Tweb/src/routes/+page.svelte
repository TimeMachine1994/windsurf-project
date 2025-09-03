<!-- Hero Section -->
<section class="hero">
	<div class="container">
		<div class="hero-content">
			<h1 class="hero-title">Honoring a Life, Connecting a World.</h1>
			<p class="hero-subtitle">
				When distance separates us, Tributestream brings family and friends together to honor a loved one with a high-quality, professional memorial livestream.
			</p>
			<div class="hero-buttons">
				<a href="/packages" class="btn btn-primary">View Packages</a>
				<a href="/for-families" class="btn btn-secondary">Learn More</a>
			</div>
		</div>
	</div>
</section>

<!-- Main Content -->
<section class="main-content">
	<div class="container">
		<div class="content-grid">
			<div class="content-text">
				<p class="lead-text">
					In today's connected world, a loved one's reach extends far beyond a single location. But when friends and family can't be there in person, they still deserve to be part of the service. Tributestream provides a seamless, respectful, and professional livestreaming service that bridges the gap, allowing everyone to participate in a meaningful celebration of life.
				</p>
				
				<p>
					We partner with funeral homes to offer a service that is both convenient and deeply valuable. Our team of compassionate professionals handles all the technology, ensuring a flawless production so that families can focus on what matters most—remembering their loved one.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="features">
	<div class="container">
		<h2 class="section-title">What We Offer</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🎥</div>
				<h3>Professional Videography</h3>
				<p>Our team uses cutting-edge technology to capture high-quality, cinematic video and sound.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">📡</div>
				<h3>Flawless Livestreaming</h3>
				<p>We eliminate the risk of technical issues, providing a stable, reliable stream for all attendees.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">💾</div>
				<h3>Digital Keepsakes</h3>
				<p>Every service is preserved and can be downloaded or delivered on a custom USB drive, so the memories can be cherished for generations.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">🤝</div>
				<h3>A Focus on Respect</h3>
				<p>We specialize exclusively in memorials and celebrations of life, ensuring every detail is handled with the dignity and care it deserves.</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="cta-section">
	<div class="container">
		<div class="cta-content">
			<h2>Ready to Honor Your Loved One?</h2>
			<p>Contact us today to learn more about our professional memorial livestreaming services.</p>
			<div class="cta-buttons">
				<a href="/contact" class="btn btn-primary">Get Started</a>
				<a href="/for-funeral-homes" class="btn btn-outline">For Funeral Homes</a>
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

	.hero h1 {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		color: var(--color-background);
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	}

	.hero p {
		font-size: 1.25rem;
		margin-bottom: 2rem;
		color: var(--color-background);
		opacity: 0.9;
		max-width: 600px;
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

	.features {
		padding: 4rem 0;
		background: var(--color-surface);
	}

	.section-title {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
		color: var(--color-text);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.feature-card {
		background: var(--color-background);
		padding: 2rem;
		border-radius: 1rem;
		text-align: center;
		box-shadow: var(--shadow-md);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.feature-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		color: var(--color-text);
		margin-bottom: 1rem;
		font-size: 1.25rem;
	}

	.feature-card p {
		color: var(--color-text-secondary);
		line-height: 1.6;
	}

	.cta-section {
		padding: 4rem 0;
		background: var(--color-background);
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
		
		.features-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
