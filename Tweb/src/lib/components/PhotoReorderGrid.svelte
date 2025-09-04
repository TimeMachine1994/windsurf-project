<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SlideshowPhoto } from '$lib/firebase/storage';

	export let photos: SlideshowPhoto[] = [];
	export let loading = false;

	const dispatch = createEventDispatcher<{
		reorder: { photos: SlideshowPhoto[] };
		delete: { photoId: string };
	}>();

	let draggedIndex: number | null = null;
	let draggedOverIndex: number | null = null;

	function handleDragStart(event: DragEvent, index: number) {
		if (!event.dataTransfer) return;
		
		draggedIndex = index;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/html', '');
		
		// Add visual feedback
		const target = event.target as HTMLElement;
		target.style.opacity = '0.5';
	}

	function handleDragEnd(event: DragEvent) {
		const target = event.target as HTMLElement;
		target.style.opacity = '1';
		
		draggedIndex = null;
		draggedOverIndex = null;
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		if (!event.dataTransfer) return;
		
		event.dataTransfer.dropEffect = 'move';
		draggedOverIndex = index;
	}

	function handleDragLeave() {
		draggedOverIndex = null;
	}

	function handleDrop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		
		if (draggedIndex === null || draggedIndex === dropIndex) {
			draggedIndex = null;
			draggedOverIndex = null;
			return;
		}

		// Create new array with reordered photos
		const newPhotos = [...photos];
		const draggedPhoto = newPhotos[draggedIndex];
		
		// Remove dragged photo from original position
		newPhotos.splice(draggedIndex, 1);
		
		// Insert at new position
		newPhotos.splice(dropIndex, 0, draggedPhoto);
		
		// Update order values
		const updatedPhotos = newPhotos.map((photo, index) => ({
			...photo,
			order: index
		}));

		dispatch('reorder', { photos: updatedPhotos });
		
		draggedIndex = null;
		draggedOverIndex = null;
	}

	function handleDelete(photoId: string) {
		if (confirm('Are you sure you want to delete this photo?')) {
			dispatch('delete', { photoId });
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<div class="photo-grid" class:loading>
	{#if photos.length === 0 && !loading}
		<div class="empty-state">
			<div class="empty-icon">📷</div>
			<h3>No photos yet</h3>
			<p>Upload some photos to start creating your slideshow</p>
		</div>
	{:else}
		{#each photos as photo, index (photo.id)}
			<div
				class="photo-item"
				class:dragging={draggedIndex === index}
				class:drag-over={draggedOverIndex === index && draggedIndex !== index}
				draggable="true"
				on:dragstart={(e) => handleDragStart(e, index)}
				on:dragend={handleDragEnd}
				on:dragover={(e) => handleDragOver(e, index)}
				on:dragleave={handleDragLeave}
				on:drop={(e) => handleDrop(e, index)}
				role="button"
				tabindex="0"
			>
				<div class="photo-container">
					<img src={photo.downloadUrl} alt={photo.originalName} loading="lazy" />
					<div class="photo-overlay">
						<div class="photo-info">
							<div class="photo-name">{photo.originalName}</div>
							<div class="photo-meta">
								{formatFileSize(photo.size)} • Order: {photo.order + 1}
							</div>
						</div>
						<div class="photo-actions">
							<button
								class="action-btn delete-btn"
								on:click={() => handleDelete(photo.id)}
								title="Delete photo"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
								</svg>
							</button>
						</div>
					</div>
					<div class="drag-handle">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z"/>
						</svg>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		padding: 1rem;
		min-height: 200px;
	}

	.photo-grid.loading {
		opacity: 0.6;
		pointer-events: none;
	}

	.empty-state {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		text-align: center;
		color: #666;
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

	.photo-item {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		background: #f5f5f5;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		cursor: grab;
	}

	.photo-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.photo-item:active {
		cursor: grabbing;
	}

	.photo-item.dragging {
		opacity: 0.5;
		transform: rotate(5deg) scale(1.05);
		z-index: 1000;
	}

	.photo-item.drag-over {
		border: 2px dashed #007bff;
		background: rgba(0, 123, 255, 0.1);
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
		transition: opacity 0.2s ease;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 0.75rem;
	}

	.photo-item:hover .photo-overlay {
		opacity: 1;
	}

	.photo-info {
		color: white;
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

	.photo-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.action-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 4px;
		padding: 0.5rem;
		color: white;
		cursor: pointer;
		transition: background 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.delete-btn:hover {
		background: rgba(220, 53, 69, 0.8);
	}

	.drag-handle {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 4px;
		padding: 0.25rem;
		color: white;
		opacity: 0;
		transition: opacity 0.2s ease;
		pointer-events: none;
	}

	.photo-item:hover .drag-handle {
		opacity: 1;
	}

	@media (max-width: 768px) {
		.photo-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 0.75rem;
			padding: 0.75rem;
		}

		.photo-container {
			height: 150px;
		}

		.photo-overlay {
			padding: 0.5rem;
		}

		.photo-name {
			font-size: 0.8rem;
		}

		.photo-meta {
			font-size: 0.7rem;
		}
	}
</style>
