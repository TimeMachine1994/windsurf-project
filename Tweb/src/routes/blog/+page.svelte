<!-- Hero Section -->
<section class="hero">
	<div class="container">
		<div class="hero-content">
			<h1 class="hero-title">Tributestream Blog</h1>
			<p class="hero-subtitle">
				Insights, guidance, and stories about honoring loved ones in the digital age.
			</p>
		</div>
	</div>
</section>

<!-- Blog Posts -->
<section class="blog-posts">
	<div class="container">
		<div class="posts-grid">
			<article class="post-card">
				<div class="post-header">
					<h2 class="post-title">
						<a href="/blog/livestream-grief-together">Why a Livestream is the New Way to Grieve Together</a>
					</h2>
					<div class="post-meta">
						<span class="post-date">Recent</span>
						<span class="post-category">Grief & Healing</span>
					</div>
				</div>
				<div class="post-content">
					<p class="post-excerpt">
						In the past, attending a funeral was a local affair. Today, however, family, friends, and colleagues are spread across the globe. This has created a new challenge for grieving communities: how do you come together when you're physically apart?
					</p>
					<a href="/blog/livestream-grief-together" class="read-more">Read More →</a>
				</div>
			</article>

			<article class="post-card">
				<div class="post-header">
					<h2 class="post-title">
						<a href="/blog/professional-livestream-necessity">Planning a Funeral? Here's Why a Professional Livestream is a Must-Have</a>
					</h2>
					<div class="post-meta">
						<span class="post-date">Recent</span>
						<span class="post-category">Planning & Technology</span>
					</div>
				</div>
				<div class="post-content">
					<p class="post-excerpt">
						You're already balancing countless details when planning a funeral service. In the midst of this, the idea of adding "tech support" to your list can be overwhelming. Here's why a professional service is not just a convenience, but a necessity.
					</p>
					<a href="/blog/professional-livestream-necessity" class="read-more">Read More →</a>
				</div>
			</article>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="cta-section">
	<div class="container">
		<div class="cta-content">
			<h2>Need Professional Memorial Services?</h2>
			<p>Let us help you honor your loved one with dignity and bring your family together.</p>
			<div class="cta-buttons">
				<a href="/packages" class="btn btn-primary">View Our Packages</a>
				<a href="/contact" class="btn btn-outline">Contact Us</a>
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

	.blog-posts {
		padding: 4rem 0;
		background: var(--color-background);
	}

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.post-card {
		background: var(--color-surface);
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: var(--shadow-md);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.post-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.post-header {
		margin-bottom: 1.5rem;
	}

	.post-title {
		margin-bottom: 1rem;
	}

	.post-title a {
		color: var(--color-text);
		text-decoration: none;
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.post-title a:hover {
		color: var(--color-primary);
	}

	.post-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.post-category {
		background: var(--color-primary-alpha);
		color: var(--color-primary);
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-weight: 500;
	}

	.post-content {
		color: var(--color-text-secondary);
	}

	.post-excerpt {
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.read-more {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s ease;
	}

	.read-more:hover {
		color: var(--color-primary-dark);
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
		
		.posts-grid {
			grid-template-columns: 1fr;
		}
		
		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
