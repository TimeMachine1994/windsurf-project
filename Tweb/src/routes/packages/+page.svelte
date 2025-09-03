<!-- Hero Section -->
<section class="hero">
	<div class="container">
		<div class="hero-content">
			<h1 class="hero-title">Choose the Right Package to Honor Your Loved One.</h1>
			<p class="hero-subtitle">
				From a high-quality video recording to our all-inclusive legacy package, we have an option for every need.
			</p>
		</div>
	</div>
</section>

<!-- Main Content -->
<section class="main-content">
	<div class="container">
		<div class="content-text">
			<p class="lead-text">
				We believe in transparent pricing and clear value. All of our packages include one hour of setup, two hours of videography, professional video and audio, a custom link with one year of hosting, and a complimentary download of the original video.
			</p>
		</div>
	</div>
</section>

<!-- Packages Section -->
<section class="packages">
	<div class="container">
		<div class="packages-grid">
			<!-- Record Package -->
			<div class="package-card">
				<div class="package-header">
					<div class="package-icon">🎥</div>
					<h3 class="package-name">Tributestream RECORD</h3>
					<div class="package-price">$699</div>
				</div>
				<div class="package-content">
					<p class="package-description">
						Our most economical package, ideal for families who want a professional video record of the service without the live streaming component.
					</p>
					<ul class="package-features">
						<li>Includes a professional videographer who will record for up to two hours</li>
						<li>The recording is uploaded within 24 hours to the custom link for viewing</li>
						<li>Professional video and audio quality</li>
						<li>Custom link with one year of hosting</li>
						<li>Complimentary download of the original video</li>
					</ul>
					<div class="package-note">
						<strong>Note:</strong> Does not include a live stream technician or remote producer.
					</div>
				</div>
				<div class="package-footer">
					<a href="/contact" class="btn btn-outline">Choose Record</a>
				</div>
			</div>

			<!-- Live Package -->
			<div class="package-card featured">
				<div class="package-badge">Most Popular</div>
				<div class="package-header">
					<div class="package-icon">💻</div>
					<h3 class="package-name">Tributestream LIVE</h3>
					<div class="package-price">$1,299</div>
				</div>
				<div class="package-content">
					<p class="package-description">
						This package includes a professional videographer, a professional livestream technician, and a remote producer to oversee the stream and ensure quality.
					</p>
					<ul class="package-features">
						<li>Professional videographer for up to two hours</li>
						<li>Professional livestream technician on-site</li>
						<li>Remote producer to oversee stream quality</li>
						<li>Live streaming for remote attendees</li>
						<li>Custom shareable link (averages 60-80 viewers)</li>
						<li>Professional video and audio quality</li>
						<li>One year of hosting included</li>
						<li>Complimentary download of the original video</li>
					</ul>
					<div class="package-note">
						<strong>Note:</strong> This package does not include video editing or the Tributebox USB drive.
					</div>
				</div>
				<div class="package-footer">
					<a href="/contact" class="btn btn-primary">Choose Live</a>
				</div>
			</div>

			<!-- Legacy Package -->
			<div class="package-card">
				<div class="package-header">
					<div class="package-icon">🎞️</div>
					<h3 class="package-name">Tributestream LEGACY</h3>
					<div class="package-price">$1,599</div>
				</div>
				<div class="package-content">
					<p class="package-description">
						Our highest-end service for those who want to preserve the entirety of the experience.
					</p>
					<ul class="package-features">
						<li>Professional videographer for up to two hours</li>
						<li>Professional livestream technician on-site</li>
						<li>Remote producer to oversee stream quality</li>
						<li>Live streaming for remote attendees</li>
						<li>Post-production video editing</li>
						<li>Beautiful montage of flowers filmed at the service</li>
						<li>Engraved wooden Tributebox with USB drive</li>
						<li>Professional video and audio quality</li>
						<li>One year of hosting included</li>
						<li>Complimentary download of the original video</li>
					</ul>
					<div class="package-highlight">
						This package is for people who want a meaningful and dignified way to remember and honor their loved ones.
					</div>
				</div>
				<div class="package-footer">
					<a href="/contact" class="btn btn-outline">Choose Legacy</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="cta-section">
	<div class="container">
		<div class="cta-content">
			<h2>Need Help Choosing?</h2>
			<p>Our team is here to help you select the perfect package for your needs. Contact us for a personal consultation.</p>
			<div class="cta-buttons">
				<a href="/contact" class="btn btn-primary">Get Personal Consultation</a>
				<a href="/for-families" class="btn btn-outline">Learn More About Our Services</a>
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

	.main-content {
		padding: 4rem 0;
		background: var(--color-background);
	}

	.content-text {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.lead-text {
		font-size: 1.125rem;
		line-height: 1.7;
		color: var(--color-text);
	}

	.packages {
		padding: 4rem 0;
		background: var(--color-surface);
	}

	.packages-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.package-card {
		background: var(--color-background);
		border-radius: 1rem;
		box-shadow: var(--shadow-md);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.package-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.package-card.featured {
		border: 2px solid var(--color-primary);
		transform: scale(1.05);
	}

	.package-card.featured:hover {
		transform: scale(1.05) translateY(-4px);
	}

	.package-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: var(--color-primary);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.package-header {
		padding: 2rem 2rem 1rem;
		text-align: center;
		border-bottom: 1px solid var(--color-border);
	}

	.package-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.package-name {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		color: var(--color-text);
	}

	.package-price {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.package-content {
		padding: 2rem;
	}

	.package-description {
		font-size: 1rem;
		line-height: 1.6;
		margin-bottom: 1.5rem;
		color: var(--color-text-secondary);
	}

	.package-features {
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem 0;
	}

	.package-features li {
		padding: 0.5rem 0;
		color: var(--color-text);
		position: relative;
		padding-left: 1.5rem;
	}

	.package-features li:before {
		content: "✓";
		position: absolute;
		left: 0;
		color: var(--color-primary);
		font-weight: bold;
	}

	.package-note {
		background: var(--color-surface);
		padding: 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: 1rem;
	}

	.package-highlight {
		background: var(--color-primary-alpha);
		padding: 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text);
		font-style: italic;
		margin-bottom: 1rem;
	}

	.package-footer {
		padding: 0 2rem 2rem;
	}

	.package-footer .btn {
		width: 100%;
		justify-content: center;
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
		
		.packages-grid {
			grid-template-columns: 1fr;
		}
		
		.package-card.featured {
			transform: none;
		}
		
		.package-card.featured:hover {
			transform: translateY(-4px);
		}
		
		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
