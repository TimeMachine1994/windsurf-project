<script lang="ts">
	import type { SlideshowPhoto } from '$lib/firebase/storage';
	import PhotoShadowbox from './PhotoShadowbox.svelte';

	export let photos: SlideshowPhoto[] = [];
	export let readonly = false;

	let selectedPhotoIndex: number | null = null;
	let showShadowbox = false;

	function openPhoto(index: number) {
		selectedPhotoIndex = index;
		showShadowbox = true;
	}

	function closeShadowbox() {
		showShadowbox = false;
		selectedPhotoIndex = null;
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<div class="photo-gallery">
	{#if photos.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🖼️</div>
			<h3>No photos to display</h3>
			<p>Photos will appear here once they're uploaded</p>
		</div>
	{:else}
		<div class="gallery-grid">
			{#each photos as photo, index (photo.id)}
				<div 
					class="gallery-item"
					role="button"
					tabindex="0"
					on:click={() => openPhoto(index)}
					on:keydown={(e) => e.key === 'Enter' && openPhoto(index)}
				>
					<div class="photo-container">
						<img 
							src={photo.downloadUrl} 
							alt={photo.originalName} 
							loading="lazy"
						/>
						<div class="photo-overlay">
							<div class="photo-info">
								<div class="photo-name">{photo.originalName}</div>
								<div class="photo-meta">
									{formatFileSize(photo.size)}
								</div>
							</div>
							<div class="view-icon">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if showShadowbox && selectedPhotoIndex !== null}
	<PhotoShadowbox 
		{photos}
		initialIndex={selectedPhotoIndex}
		on:close={closeShadowbox}
	/>
{/if}

<style>
	.photo-gallery {
		width: 100%;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		text-align: center;
		color: #666;
		border: 2px dashed #ddd;
		border-radius: 12px;
		background: #fafafa;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	.empty-state p {
		margin: 0;
		font-size: 0.9rem;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		padding: 1rem;
	}

	.gallery-item {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		background: #f5f5f5;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.gallery-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	.gallery-item:focus {
		outline: 2px solid #007bff;
		outline-offset: 2px;
	}

	.photo-container {
		position: relative;
		width: 100%;
		height: 200px;
	}

	.photo-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.photo-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.7) 0%,
			transparent 30%,
			transparent 70%,
			rgba(0, 0, 0, 0.7) 100%
		);
		opacity: 0;
		transition: opacity 0.3s ease;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
	}

	.gallery-item:hover .photo-overlay {
		opacity: 1;
	}

	.photo-info {
		color: white;
		text-align: center;
		width: 100%;
	}

	.photo-name {
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 0.25rem;
		word-break: break-word;
	}

	.photo-meta {
		font-size: 0.75rem;
		opacity: 0.9;
	}

	.view-icon {
		color: white;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		padding: 0.75rem;
		transition: transform 0.2s ease;
	}

	.gallery-item:hover .view-icon {
		transform: scale(1.1);
	}

	@media (max-width: 768px) {
		.gallery-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 0.75rem;
			padding: 0.75rem;
		}

		.photo-container {
			height: 150px;
		}

		.photo-overlay {
			padding: 0.75rem;
		}

		.photo-name {
			font-size: 0.8rem;
		}

		.photo-meta {
			font-size: 0.7rem;
		}

		.view-icon {
			padding: 0.5rem;
		}
	}
</style>
