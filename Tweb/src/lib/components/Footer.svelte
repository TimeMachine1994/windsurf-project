<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container">
		<div class="footer-content">
			<div class="footer-section">
				<h3>Your App</h3>
				<p>Building amazing experiences with modern web technology.</p>
			</div>
			
			<div class="footer-section">
				<h4>Quick Links</h4>
				<ul class="footer-links">
					<li><a href="/">Home</a></li>
					<li><a href="/about">About</a></li>
					<li><a href="/contact">Contact</a></li>
					<li><a href="/privacy">Privacy Policy</a></li>
				</ul>
			</div>
			
			<div class="footer-section">
				<h4>Connect</h4>
				<ul class="footer-links">
					<li><a href="#" target="_blank" rel="noopener noreferrer">Twitter</a></li>
					<li><a href="#" target="_blank" rel="noopener noreferrer">GitHub</a></li>
					<li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
				</ul>
			</div>
			
			<div class="footer-section">
				<h4>Support</h4>
				<ul class="footer-links">
					<li><a href="/help">Help Center</a></li>
					<li><a href="/docs">Documentation</a></li>
					<li><a href="/contact">Contact Support</a></li>
				</ul>
			</div>
		</div>
		
		<div class="footer-bottom">
			<p>&copy; {currentYear} Your App. All rights reserved.</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		background: #1f2937;
		color: #e5e7eb;
		padding: 3rem 0 1rem;
		margin-top: auto;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}
	
	.footer-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}
	
	.footer-section h3 {
		color: white;
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 700;
	}
	
	.footer-section h4 {
		color: white;
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 600;
	}
	
	.footer-section p {
		margin: 0;
		line-height: 1.6;
		color: #9ca3af;
	}
	
	.footer-links {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	
	.footer-links li {
		margin-bottom: 0.5rem;
	}
	
	.footer-links a {
		color: #9ca3af;
		text-decoration: none;
		transition: color 0.2s ease;
	}
	
	.footer-links a:hover {
		color: white;
	}
	
	.footer-bottom {
		border-top: 1px solid #374151;
		padding-top: 1rem;
		text-align: center;
	}
	
	.footer-bottom p {
		margin: 0;
		color: #9ca3af;
		font-size: 0.875rem;
	}
	
	@media (max-width: 768px) {
		.footer {
			padding: 2rem 0 1rem;
		}
		
		.footer-content {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		
		.footer-section {
			text-align: center;
		}
	}
</style>
