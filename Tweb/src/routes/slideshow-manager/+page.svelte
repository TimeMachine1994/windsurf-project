<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/firebase/config';
	import { getUserProfile, onAuthStateChange, type UserProfile } from '$lib/firebase/auth';
	import { getMemorialByCreatorUid, type Memorial } from '$lib/firebase/memorial';
	import { 
		uploadSlideshowPhoto, 
		getSlideshowPhotos, 
		updatePhotoOrder, 
		deleteSlideshowPhoto,
		type SlideshowPhoto 
	} from '$lib/firebase/storage';
	import PhotoUploader from '$lib/components/PhotoUploader.svelte';
	import PhotoReorderGrid from '$lib/components/PhotoReorderGrid.svelte';
	import PhotoGallery from '$lib/components/PhotoGallery.svelte';

	let user: UserProfile | null = null;
	let memorial: Memorial | null = null;
	let photos: SlideshowPhoto[] = [];
	let loading = true;
	let uploading = false;
	let saving = false;
	let error = '';
	let successMessage = '';

	// Auto-save functionality
	let autoSaveTimeout: NodeJS.Timeout;
	const AUTO_SAVE_DELAY = 1000; // 1 second delay after last change

	onMount(() => {
		const unsubscribe = onAuthStateChange(async (firebaseUser) => {
			if (!firebaseUser) {
				goto('/login');
				return;
			}

			try {
				// Get user profile
				const profile = await getUserProfile(firebaseUser.uid);
				if (!profile) {
					error = 'User profile not found';
					loading = false;
					return;
				}

				user = profile;

				// Check if user is an Owner (memorial creators can manage slideshows)
				if (profile.role !== 'Owner' && profile.role !== 'Admin') {
					error = 'Access denied. Only memorial owners can manage slideshows.';
					loading = false;
					return;
				}

				// Get memorial for this user
				const userMemorial = await getMemorialByCreatorUid(firebaseUser.uid);
				if (!userMemorial) {
					error = 'No memorial found. Please create a memorial first.';
					loading = false;
					return;
				}

				memorial = userMemorial;
				await loadPhotos();
			} catch (err: any) {
				console.error('Error loading user data:', err);
				error = 'Failed to load user data';
			} finally {
				loading = false;
			}
		});

		return unsubscribe;
	});

	async function loadPhotos() {
		if (!memorial) return;

		try {
			photos = await getSlideshowPhotos(memorial.id);
			console.log(`Loaded ${photos.length} photos for slideshow`);
		} catch (err: any) {
			console.error('Error loading photos:', err);
			error = 'Failed to load photos';
		}
	}

	async function handlePhotoUpload(event: CustomEvent<{ files: File[] }>) {
		if (!memorial || !user) return;

		const { files } = event.detail;
		uploading = true;
		error = '';

		try {
			// Upload files sequentially to maintain order
			for (const file of files) {
				const uploadedPhoto = await uploadSlideshowPhoto(memorial.id, file, user.uid);
				photos = [...photos, uploadedPhoto];
			}

			successMessage = `Successfully uploaded ${files.length} photo${files.length > 1 ? 's' : ''}`;
			setTimeout(() => { successMessage = ''; }, 3000);
		} catch (err: any) {
			console.error('Error uploading photos:', err);
			error = `Failed to upload photos: ${err.message}`;
		} finally {
			uploading = false;
		}
	}

	async function handlePhotoReorder(event: CustomEvent<{ photos: SlideshowPhoto[] }>) {
		const { photos: reorderedPhotos } = event.detail;
		
		// Update local state immediately for responsive UI
		photos = reorderedPhotos;
		
		// Clear any existing auto-save timeout
		if (autoSaveTimeout) {
			clearTimeout(autoSaveTimeout);
		}

		// Set new auto-save timeout
		autoSaveTimeout = setTimeout(async () => {
			await savePhotoOrder(reorderedPhotos);
		}, AUTO_SAVE_DELAY);
	}

	async function savePhotoOrder(reorderedPhotos: SlideshowPhoto[]) {
		if (!memorial) return;

		saving = true;
		error = '';

		try {
			// Create update array with new order values
			const photoUpdates = reorderedPhotos.map((photo, index) => ({
				id: photo.id,
				order: index
			}));

			await updatePhotoOrder(memorial.id, photoUpdates);
			
			// Show brief success indicator
			successMessage = 'Order saved automatically';
			setTimeout(() => { successMessage = ''; }, 2000);
			
			console.log('Photo order saved successfully');
		} catch (err: any) {
			console.error('Error saving photo order:', err);
			error = 'Failed to save photo order. Please try again.';
			
			// Reload photos to restore correct order
			await loadPhotos();
		} finally {
			saving = false;
		}
	}

	async function handlePhotoDelete(event: CustomEvent<{ photoId: string }>) {
		if (!memorial) return;

		const { photoId } = event.detail;
		
		try {
			await deleteSlideshowPhoto(memorial.id, photoId);
			
			// Remove from local state
			photos = photos.filter(photo => photo.id !== photoId);
			
			// Reorder remaining photos to maintain sequence
			const reorderedPhotos = photos.map((photo, index) => ({
				...photo,
				order: index
			}));
			
			if (reorderedPhotos.length > 0) {
				await savePhotoOrder(reorderedPhotos);
			}
			
			successMessage = 'Photo deleted successfully';
			setTimeout(() => { successMessage = ''; }, 3000);
		} catch (err: any) {
			console.error('Error deleting photo:', err);
			error = `Failed to delete photo: ${err.message}`;
		}
	}

	// Cleanup auto-save timeout on component destroy
	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (autoSaveTimeout) {
			clearTimeout(autoSaveTimeout);
		}
	});
</script>

<svelte:head>
	<title>Slideshow Manager - TributeStream</title>
	<meta name="description" content="Manage photos for your memorial slideshow" />
</svelte:head>

<div class="slideshow-manager">
	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading slideshow manager...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<div class="error-icon">⚠️</div>
			<h2>Access Error</h2>
			<p>{error}</p>
			<div class="error-actions">
				<a href="/" class="btn btn-primary">Return Home</a>
				{#if error.includes('memorial')}
					<a href="/create-memorial" class="btn btn-secondary">Create Memorial</a>
				{/if}
			</div>
		</div>
	{:else if memorial && user}
		<div class="manager-header">
			<div class="header-content">
				<div class="header-text">
					<h1>Slideshow Manager</h1>
					<p class="memorial-info">
						Managing photos for <strong>{memorial.lovedOneName}'s</strong> memorial
					</p>
					<div class="photo-count">
						{photos.length} photo{photos.length !== 1 ? 's' : ''} in slideshow
					</div>
				</div>
				<div class="header-actions">
					<a href="/{memorial.customUrl}" class="btn btn-outline" target="_blank">
						View Memorial
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
						</svg>
					</a>
				</div>
			</div>
		</div>

		<!-- Status Messages -->
		{#if successMessage}
			<div class="status-message success">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
				</svg>
				{successMessage}
			</div>
		{/if}

		{#if error}
			<div class="status-message error">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
				</svg>
				{error}
			</div>
		{/if}

		<!-- Auto-save indicator -->
		{#if saving}
			<div class="auto-save-indicator">
				<div class="save-spinner"></div>
				Saving changes...
			</div>
		{/if}

		<div class="manager-content">
			<!-- Photo Upload Section -->
			<div class="upload-section">
				<h2>Upload New Photos</h2>
				<p class="section-description">
					Add photos to your memorial slideshow. Drag and drop multiple files or click to browse.
				</p>
				<PhotoUploader 
					{uploading} 
					on:upload={handlePhotoUpload}
				/>
			</div>

			<!-- Photo Management Section -->
			<div class="photos-section">
				<div class="section-header">
					<h2>Manage Photos</h2>
					<p class="section-description">
						Drag photos to reorder them. Changes save automatically.
					</p>
				</div>
				
				<PhotoReorderGrid 
					{photos} 
					loading={uploading || saving}
					on:reorder={handlePhotoReorder}
					on:delete={handlePhotoDelete}
				/>
			</div>

			<!-- Photo Gallery Section -->
			<div class="gallery-section">
				<div class="section-header">
					<h2>Preview Gallery</h2>
					<p class="section-description">
						Click on any photo to view it in fullscreen with slideshow controls.
					</p>
				</div>
				
				<PhotoGallery {photos} readonly={true} />
			</div>
		</div>
	{/if}
</div>

<style>
	.slideshow-manager {
		min-height: 100vh;
		background: #f8f9fa;
	}

	.loading-container, .error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 2rem;
		text-align: center;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #007bff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error-container {
		color: #721c24;
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 8px;
		margin: 2rem;
		padding: 3rem;
	}

	.error-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.manager-header {
		background: white;
		border-bottom: 1px solid #dee2e6;
		padding: 2rem 0;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.header-text h1 {
		margin: 0 0 0.5rem 0;
		color: #212529;
		font-size: 2rem;
	}

	.memorial-info {
		margin: 0 0 0.5rem 0;
		color: #6c757d;
		font-size: 1.1rem;
	}

	.photo-count {
		color: #495057;
		font-size: 0.9rem;
		background: #e9ecef;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		display: inline-block;
	}

	.header-actions {
		flex-shrink: 0;
	}

	.status-message {
		max-width: 1200px;
		margin: 1rem auto;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
	}

	.status-message.success {
		background: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.status-message.error {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	.auto-save-indicator {
		position: fixed;
		top: 20px;
		right: 20px;
		background: #007bff;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		z-index: 1000;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.save-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.manager-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.upload-section, .photos-section, .gallery-section {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.section-header {
		margin-bottom: 1.5rem;
	}

	.upload-section h2, .photos-section h2 {
		margin: 0 0 0.5rem 0;
		color: #212529;
		font-size: 1.5rem;
	}

	.section-description {
		margin: 0 0 1.5rem 0;
		color: #6c757d;
		font-size: 1rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.9rem;
	}

	.btn-primary {
		background: #007bff;
		color: white;
	}

	.btn-primary:hover {
		background: #0056b3;
	}

	.btn-secondary {
		background: #6c757d;
		color: white;
	}

	.btn-secondary:hover {
		background: #545b62;
	}

	.btn-outline {
		background: transparent;
		color: #007bff;
		border: 1px solid #007bff;
	}

	.btn-outline:hover {
		background: #007bff;
		color: white;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.header-text h1 {
			font-size: 1.75rem;
		}

		.manager-content {
			padding: 1rem;
		}

		.upload-section, .photos-section, .gallery-section {
			padding: 1.5rem;
		}

		.error-actions {
			flex-direction: column;
			align-items: center;
		}

		.auto-save-indicator {
			top: 10px;
			right: 10px;
			font-size: 0.8rem;
			padding: 0.4rem 0.8rem;
		}
	}
</style>
