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
							<button class="control-btn fullscreen-btn" aria-label="Toggle fullscreen">
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
						<p class="created-info">Memorial created on {typeof memorial.createdAt === 'object' && memorial.createdAt && 'toDate' in memorial.createdAt ? (memorial.createdAt as any).toDate().toLocaleDateString() : new Date(memorial.createdAt as any).toLocaleDateString()}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

