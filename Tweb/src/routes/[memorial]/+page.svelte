<script lang="ts">
	import { page } from '$app/stores';
	import { getMemorialByUrl } from '$lib/firebase/memorial';
	import { onMount } from 'svelte';
	import type { Memorial } from '$lib/firebase/memorial';
	
	let memorial: Memorial | null = null;
	let loading = true;
	let error = '';
	
	$: memorialUrl = $page.params.memorial;
	
	onMount(async () => {
		if (memorialUrl) {
			try {
				memorial = await getMemorialByUrl(memorialUrl);
				if (!memorial) {
					error = 'Memorial not found';
				}
			} catch (err: any) {
				error = 'Failed to load memorial';
				console.error('Error loading memorial:', err);
			} finally {
				loading = false;
			}
		}
	});
</script>

<svelte:head>
	{#if memorial}
		<title>In Memory of {memorial.lovedOneName}</title>
		<meta name="description" content="A celebration of life for {memorial.lovedOneName}" />
	{:else}
		<title>Memorial Page</title>
	{/if}
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="spinner"></div>
		<p>Loading memorial...</p>
	</div>
{:else if error}
	<div class="error-container">
		<h1>Memorial Not Found</h1>
		<p>{error}</p>
		<a href="/" class="btn btn-primary">Return Home</a>
	</div>
{:else if memorial}
	<div class="memorial-page">
		<div class="hero-section">
			<div class="container">
				<h1 class="page-title">Celebration of Life for {memorial.lovedOneName}</h1>
			</div>
		</div>
		
		<div class="content-section">
			<div class="container">
				<div class="memorial-content">
					<!-- Video Player Section -->
					<div class="video-player-container">
						<div class="video-player">
							<div class="video-placeholder">
								<div class="play-button">
									<svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
										<path d="M8 5v14l11-7z"/>
									</svg>
								</div>
								<p class="video-status">Live Stream Coming Soon</p>
							</div>
						</div>
						<div class="video-controls">
							<button class="control-btn">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M8 5v14l11-7z"/>
								</svg>
								Play
							</button>
							<button class="control-btn">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M14,19H18V5H14M6,19H10V5H6V19Z"/>
								</svg>
								Pause
							</button>
							<div class="volume-control">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.01,19.86 21,16.28 21,12C21,7.72 18.01,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
								</svg>
								<input type="range" min="0" max="100" value="50" class="volume-slider">
							</div>
							<button class="control-btn fullscreen-btn">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z"/>
								</svg>
							</button>
						</div>
					</div>
					
					<div class="welcome-message">
						<h3>Welcome to {memorial.lovedOneName}'s Memorial</h3>
						<p>This memorial was created by {memorial.creatorName} to honor and celebrate the life of {memorial.lovedOneName}.</p>
						<p>Here, family and friends can share memories, photos, and stories that capture the essence of who {memorial.lovedOneName} was and the impact they had on our lives.</p>
					</div>
					
					<div class="memorial-actions">
						<button class="btn btn-primary">Share a Memory</button>
						<button class="btn btn-secondary">Upload Photos</button>
						<button class="btn btn-secondary">Light a Candle</button>
					</div>
					
					<div class="memorial-info">
						<p class="created-info">Memorial created on {memorial.createdAt?.toDate ? memorial.createdAt.toDate().toLocaleDateString() : new Date(memorial.createdAt).toLocaleDateString()}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.loading-container, .error-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 80vh;
		text-align: center;
		padding: 2rem;
	}
	
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e5e7eb;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.error-container h1 {
		color: #dc2626;
		margin-bottom: 1rem;
	}
	
	.memorial-page {
		min-height: 80vh;
	}
	
	.hero-section {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 4rem 0;
		text-align: center;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}
	
	.page-title {
		font-size: 3rem;
		font-weight: 700;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		line-height: 1.2;
	}
	
	.video-player-container {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		margin-bottom: 2rem;
	}
	
	.video-player {
		position: relative;
		width: 100%;
		height: 400px;
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}
	
	.video-placeholder {
		text-align: center;
		opacity: 0.8;
	}
	
	.play-button {
		width: 80px;
		height: 80px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}
	
	.play-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.1);
	}
	
	.video-status {
		font-size: 1.1rem;
		margin: 0;
		font-weight: 500;
	}
	
	.video-controls {
		background: #f8f9fa;
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		border-top: 1px solid #e5e7eb;
	}
	
	.control-btn {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.5rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		color: #374151;
	}
	
	.control-btn:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}
	
	.volume-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: auto;
		color: #6b7280;
	}
	
	.volume-slider {
		width: 100px;
		height: 4px;
		background: #d1d5db;
		border-radius: 2px;
		outline: none;
		cursor: pointer;
	}
	
	.volume-slider::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		background: #667eea;
		border-radius: 50%;
		cursor: pointer;
	}
	
	.fullscreen-btn {
		margin-left: 0.5rem;
	}
	
	.content-section {
		padding: 3rem 0;
		background: #f8f9fa;
	}
	
	.memorial-content {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}
	
	.welcome-message {
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}
	
	.welcome-message h3 {
		color: #1f2937;
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
	}
	
	.welcome-message p {
		color: #4b5563;
		line-height: 1.7;
		margin: 0 0 1rem 0;
	}
	
	.welcome-message p:last-child {
		margin-bottom: 0;
	}
	
	.memorial-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}
	
	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		display: inline-block;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}
	
	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}
	
	.memorial-info {
		color: #6b7280;
		font-size: 0.875rem;
	}
	
	.created-info {
		margin: 0;
	}
	
	@media (max-width: 768px) {
		.page-title {
			font-size: 2rem;
		}
		
		.video-player {
			height: 250px;
		}
		
		.video-controls {
			flex-wrap: wrap;
			gap: 0.5rem;
		}
		
		.volume-control {
			margin-left: 0;
			width: 100%;
			justify-content: center;
		}
		
		.memorial-actions {
			flex-direction: column;
			align-items: center;
		}
		
		.btn {
			width: 100%;
			max-width: 250px;
		}
	}
</style>
