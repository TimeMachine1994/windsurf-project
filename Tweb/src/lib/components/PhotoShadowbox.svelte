<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import type { SlideshowPhoto } from '$lib/firebase/storage';

	export let photos: SlideshowPhoto[] = [];
	export let initialIndex = 0;

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	let currentIndex = initialIndex;
	let isPlaying = false;
	let slideshowInterval: NodeJS.Timeout | null = null;
	let slideshowDelay = 3; // seconds
	let showControls = true;
	let controlsTimeout: NodeJS.Timeout | null = null;

	$: currentPhoto = photos[currentIndex];

	onMount(() => {
		// Prevent body scroll when modal is open
		document.body.style.overflow = 'hidden';
		
		// Add keyboard event listeners
		document.addEventListener('keydown', handleKeydown);
		
		// Auto-hide controls after 3 seconds of inactivity
		resetControlsTimeout();
	});

	onDestroy(() => {
		// Restore body scroll
		document.body.style.overflow = '';
		
		// Clean up event listeners and intervals
		document.removeEventListener('keydown', handleKeydown);
		if (slideshowInterval) {
			clearInterval(slideshowInterval);
		}
		if (controlsTimeout) {
			clearTimeout(controlsTimeout);
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Escape':
				close();
				break;
			case 'ArrowLeft':
				previousPhoto();
				break;
			case 'ArrowRight':
				nextPhoto();
				break;
			case ' ':
				event.preventDefault();
				toggleSlideshow();
				break;
		}
		resetControlsTimeout();
	}

	function close() {
		if (isPlaying) {
			stopSlideshow();
		}
		dispatch('close');
	}

	function previousPhoto() {
		currentIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
		resetControlsTimeout();
	}

	function nextPhoto() {
		currentIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
		resetControlsTimeout();
	}

	function toggleSlideshow() {
		if (isPlaying) {
			stopSlideshow();
		} else {
			startSlideshow();
		}
		resetControlsTimeout();
	}

	function startSlideshow() {
		isPlaying = true;
		slideshowInterval = setInterval(() => {
			nextPhoto();
		}, slideshowDelay * 1000);
	}

	function stopSlideshow() {
		isPlaying = false;
		if (slideshowInterval) {
			clearInterval(slideshowInterval);
			slideshowInterval = null;
		}
	}

	function handleDelayChange(event: Event) {
		const target = event.target as HTMLInputElement;
		slideshowDelay = parseInt(target.value);
		
		// Restart slideshow with new delay if currently playing
		if (isPlaying) {
			stopSlideshow();
			startSlideshow();
		}
		resetControlsTimeout();
	}

	function resetControlsTimeout() {
		showControls = true;
		if (controlsTimeout) {
			clearTimeout(controlsTimeout);
		}
		controlsTimeout = setTimeout(() => {
			if (!isPlaying) {
				showControls = false;
			}
		}, 3000);
	}

	function handleMouseMove() {
		resetControlsTimeout();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}
</script>

<div 
	class="shadowbox-backdrop"
	on:click={handleBackdropClick}
	on:mousemove={handleMouseMove}
	role="dialog"
	aria-modal="true"
	aria-label="Photo slideshow viewer"
>
	<div class="shadowbox-container">
		<!-- Close Button -->
		<button 
			class="close-button"
			class:visible={showControls}
			on:click={close}
			aria-label="Close slideshow"
		>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
				<path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
			</svg>
		</button>

		<!-- Main Photo -->
		<div class="photo-display">
			{#if currentPhoto}
				<img 
					src={currentPhoto.downloadUrl} 
					alt={currentPhoto.originalName}
					class="main-photo"
				/>
			{/if}
		</div>

		<!-- Navigation Arrows -->
		{#if photos.length > 1}
			<button 
				class="nav-button prev-button"
				class:visible={showControls}
				on:click={previousPhoto}
				aria-label="Previous photo"
			>
				<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
					<path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/>
				</svg>
			</button>

			<button 
				class="nav-button next-button"
				class:visible={showControls}
				on:click={nextPhoto}
				aria-label="Next photo"
			>
				<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
					<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
				</svg>
			</button>
		{/if}

		<!-- Controls Panel -->
		<div class="controls-panel" class:visible={showControls}>
			<div class="photo-info">
				<div class="photo-title">{currentPhoto?.originalName}</div>
				<div class="photo-counter">
					{currentIndex + 1} of {photos.length}
				</div>
			</div>

			{#if photos.length > 1}
				<div class="slideshow-controls">
					<button 
						class="control-button play-button"
						on:click={toggleSlideshow}
						aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
					>
						{#if isPlaying}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M14,19H18V5H14M6,19H10V5H6V19Z"/>
							</svg>
							Pause
						{:else}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
							</svg>
							Play
						{/if}
					</button>

					<div class="timer-control">
						<label for="slideshow-delay">Delay:</label>
						<select 
							id="slideshow-delay"
							bind:value={slideshowDelay}
							on:change={handleDelayChange}
						>
							<option value={1}>1s</option>
							<option value={2}>2s</option>
							<option value={3}>3s</option>
							<option value={5}>5s</option>
							<option value={10}>10s</option>
						</select>
					</div>
				</div>
			{/if}
		</div>

		<!-- Thumbnail Strip -->
		{#if photos.length > 1}
			<div class="thumbnail-strip" class:visible={showControls}>
				{#each photos as photo, index}
					<button
						class="thumbnail"
						class:active={index === currentIndex}
						on:click={() => { currentIndex = index; resetControlsTimeout(); }}
						aria-label="View photo {index + 1}"
					>
						<img src={photo.downloadUrl} alt={photo.originalName} />
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.shadowbox-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		cursor: none;
	}

	.shadowbox-container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		box-sizing: border-box;
	}

	.close-button {
		position: absolute;
		top: 2rem;
		right: 2rem;
		background: rgba(0, 0, 0, 0.7);
		border: none;
		border-radius: 50%;
		width: 48px;
		height: 48px;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		z-index: 1001;
		opacity: 0;
		pointer-events: none;
	}

	.close-button.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.close-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	.photo-display {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 90vw;
		max-height: 70vh;
	}

	.main-photo {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: 8px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	}

	.nav-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.7);
		border: none;
		border-radius: 50%;
		width: 56px;
		height: 56px;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		opacity: 0;
		pointer-events: none;
	}

	.nav-button.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.prev-button {
		left: 2rem;
	}

	.next-button {
		right: 2rem;
	}

	.nav-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-50%) scale(1.1);
	}

	.controls-panel {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.8);
		border-radius: 12px;
		padding: 1rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 2rem;
		color: white;
		transition: all 0.3s ease;
		opacity: 0;
		pointer-events: none;
	}

	.controls-panel.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.photo-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.photo-title {
		font-weight: 500;
		font-size: 0.9rem;
	}

	.photo-counter {
		font-size: 0.8rem;
		opacity: 0.8;
	}

	.slideshow-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.control-button {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 6px;
		padding: 0.5rem 1rem;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		transition: background 0.2s ease;
	}

	.control-button:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.play-button {
		font-weight: 500;
	}

	.timer-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.timer-control label {
		opacity: 0.9;
	}

	.timer-control select {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		color: white;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.timer-control select option {
		background: #333;
		color: white;
	}

	.thumbnail-strip {
		position: absolute;
		bottom: 6rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 8px;
		max-width: 80vw;
		overflow-x: auto;
		transition: all 0.3s ease;
		opacity: 0;
		pointer-events: none;
	}

	.thumbnail-strip.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.thumbnail {
		flex-shrink: 0;
		width: 60px;
		height: 60px;
		border: none;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s ease;
		opacity: 0.6;
	}

	.thumbnail.active {
		opacity: 1;
		border: 2px solid white;
	}

	.thumbnail:hover {
		opacity: 1;
		transform: scale(1.05);
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.shadowbox-container {
			padding: 1rem;
		}

		.close-button {
			top: 1rem;
			right: 1rem;
			width: 40px;
			height: 40px;
		}

		.nav-button {
			width: 48px;
			height: 48px;
		}

		.prev-button {
			left: 1rem;
		}

		.next-button {
			right: 1rem;
		}

		.controls-panel {
			bottom: 1rem;
			padding: 0.75rem 1rem;
			gap: 1rem;
			flex-direction: column;
			align-items: center;
		}

		.slideshow-controls {
			gap: 0.75rem;
		}

		.thumbnail-strip {
			bottom: 4rem;
			max-width: 90vw;
		}

		.thumbnail {
			width: 50px;
			height: 50px;
		}

		.photo-display {
			max-height: 60vh;
		}
	}

	/* Hide scrollbar for thumbnail strip */
	.thumbnail-strip::-webkit-scrollbar {
		height: 4px;
	}

	.thumbnail-strip::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}

	.thumbnail-strip::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2px;
	}

	.thumbnail-strip::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.5);
	}
</style>
