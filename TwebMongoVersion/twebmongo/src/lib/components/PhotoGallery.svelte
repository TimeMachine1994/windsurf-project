<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/services/auth.js';

  export let memorialId: string;
  export let canManage = false; // Whether user can upload/delete photos

  interface Photo {
    id: string;
    filename: string;
    contentType: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
    order: number;
    originalSize?: number;
    compressedSize?: number;
  }

  let photos: Photo[] = [];
  let loading = true;
  let error = '';
  let selectedPhoto: Photo | null = null;
  let showLightbox = false;

  onMount(() => {
    loadPhotos();
  });

  async function loadPhotos() {
    try {
      loading = true;
      const response = await fetch(`/api/photos/memorial/${memorialId}`);
      const result = await response.json();

      if (result.success) {
        photos = result.photos;
      } else {
        error = result.error || 'Failed to load photos';
      }
    } catch (err) {
      console.error('Error loading photos:', err);
      error = 'Network error loading photos';
    } finally {
      loading = false;
    }
  }

  function openLightbox(photo: Photo) {
    selectedPhoto = photo;
    showLightbox = true;
  }

  function closeLightbox() {
    showLightbox = false;
    selectedPhoto = null;
  }

  function nextPhoto() {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % photos.length;
    selectedPhoto = photos[nextIndex];
  }

  function prevPhoto() {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    selectedPhoto = photos[prevIndex];
  }

  async function deletePhoto(photo: Photo) {
    if (!confirm(`Are you sure you want to delete "${photo.filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/photos/${photo.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        photos = photos.filter(p => p.id !== photo.id);
        if (selectedPhoto?.id === photo.id) {
          closeLightbox();
        }
      } else {
        alert(result.error || 'Failed to delete photo');
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Network error deleting photo');
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Keyboard navigation for lightbox
  function handleKeydown(event: KeyboardEvent) {
    if (!showLightbox) return;
    
    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevPhoto();
        break;
      case 'ArrowRight':
        nextPhoto();
        break;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="photo-gallery">
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading photos...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>❌ {error}</p>
      <button on:click={loadPhotos} class="retry-btn">Try Again</button>
    </div>
  {:else if photos.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📸</div>
      <h3>No Photos Yet</h3>
      <p>This memorial doesn't have any photos yet.</p>
      {#if canManage}
        <p><small>Use the photo uploader above to add the first photo.</small></p>
      {/if}
    </div>
  {:else}
    <div class="gallery-grid">
      {#each photos as photo (photo.id)}
        <div class="photo-item">
          <div class="photo-container">
            <img
              src="/api/photos/{photo.id}"
              alt={photo.filename}
              loading="lazy"
              on:click={() => openLightbox(photo)}
              on:keydown={(e) => e.key === 'Enter' && openLightbox(photo)}
              tabindex="0"
              role="button"
            />
            
            {#if canManage}
              <div class="photo-actions">
                <button
                  class="delete-btn"
                  on:click|stopPropagation={() => deletePhoto(photo)}
                  title="Delete photo"
                >
                  🗑️
                </button>
              </div>
            {/if}
          </div>
          
          <div class="photo-info">
            <p class="filename">{photo.filename}</p>
            <p class="meta">
              {formatDate(photo.uploadedAt)} • {formatFileSize(photo.compressedSize || photo.size)}
              {#if photo.originalSize && photo.compressedSize && photo.originalSize !== photo.compressedSize}
                <small>(compressed from {formatFileSize(photo.originalSize)})</small>
              {/if}
            </p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Lightbox Modal -->
{#if showLightbox && selectedPhoto}
  <div class="lightbox" on:click={closeLightbox}>
    <div class="lightbox-content" on:click|stopPropagation>
      <button class="close-btn" on:click={closeLightbox}>✕</button>
      
      <div class="lightbox-image">
        <img src="/api/photos/{selectedPhoto.id}" alt={selectedPhoto.filename} />
      </div>
      
      <div class="lightbox-info">
        <h3>{selectedPhoto.filename}</h3>
        <p>Uploaded {formatDate(selectedPhoto.uploadedAt)}</p>
        <p>{formatFileSize(selectedPhoto.compressedSize || selectedPhoto.size)}</p>
      </div>
      
      {#if photos.length > 1}
        <button class="nav-btn prev-btn" on:click={prevPhoto}>‹</button>
        <button class="nav-btn next-btn" on:click={nextPhoto}>›</button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .photo-gallery {
    width: 100%;
  }

  .loading, .error, .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  .retry-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 1rem;
  }

  .empty-state .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    margin: 0 0 0.5rem 0;
    color: #374151;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .photo-item {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  .photo-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .photo-container {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
  }

  .photo-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .photo-container:hover img {
    transform: scale(1.05);
  }

  .photo-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .photo-container:hover .photo-actions {
    opacity: 1;
  }

  .delete-btn {
    background: rgba(239, 68, 68, 0.9);
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .photo-info {
    padding: 0.75rem;
  }

  .filename {
    font-weight: 500;
    margin: 0 0 0.25rem 0;
    color: #374151;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }

  .meta small {
    display: block;
    color: #9ca3af;
    font-style: italic;
  }

  /* Lightbox Styles */
  .lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .lightbox-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    background: white;
    border-radius: 8px;
    overflow: hidden;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    cursor: pointer;
    font-size: 1.25rem;
    z-index: 10;
  }

  .lightbox-image {
    max-height: 70vh;
    overflow: hidden;
  }

  .lightbox-image img {
    width: 100%;
    height: auto;
    display: block;
  }

  .lightbox-info {
    padding: 1rem;
    background: white;
  }

  .lightbox-info h3 {
    margin: 0 0 0.5rem 0;
    color: #374151;
  }

  .lightbox-info p {
    margin: 0.25rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    font-size: 1.5rem;
    border-radius: 50%;
  }

  .prev-btn {
    left: 1rem;
  }

  .next-btn {
    right: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .gallery-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .lightbox-content {
      max-width: 95vw;
      max-height: 95vh;
    }

    .nav-btn {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1.25rem;
    }
  }
</style>
