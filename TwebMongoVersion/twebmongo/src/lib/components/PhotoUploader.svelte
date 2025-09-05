<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { user } from '$lib/services/auth.js';

  export let memorialId: string;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  let dragActive = false;
  let uploading = false;
  let uploadProgress = 0;
  let fileInput: HTMLInputElement;

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragActive = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragActive = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragActive = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
    }
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
    }
  }

  function validateFile(file: File): string | null {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP images are allowed.`;
    }
    
    if (file.size > maxFileSize) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`;
    }
    
    return null;
  }

  async function handleFiles(files: File[]) {
    if (disabled || uploading) return;

    const currentUser = $user;
    if (!currentUser) {
      dispatch('error', { message: 'You must be logged in to upload photos' });
      return;
    }

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        dispatch('error', { message: validationError });
        continue;
      }

      await uploadFile(file, currentUser.sub);
    }
  }

  async function uploadFile(file: File, userId: string) {
    uploading = true;
    uploadProgress = 0;

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('memorialId', memorialId);
      formData.append('uploadedBy', userId);

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        dispatch('uploaded', { 
          photoId: result.photoId, 
          filename: file.name 
        });
      } else {
        dispatch('error', { message: result.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      dispatch('error', { message: 'Network error during upload' });
    } finally {
      uploading = false;
      uploadProgress = 0;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  function openFileDialog() {
    if (!disabled && !uploading) {
      fileInput?.click();
    }
  }
</script>

<div class="photo-uploader">
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    multiple
    class="hidden"
    on:change={handleFileSelect}
    {disabled}
  />

  <div
    class="upload-area"
    class:drag-active={dragActive}
    class:uploading
    class:disabled
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:click={openFileDialog}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
  >
    {#if uploading}
      <div class="upload-status">
        <div class="spinner"></div>
        <p>Uploading and compressing photo...</p>
        {#if uploadProgress > 0}
          <div class="progress-bar">
            <div class="progress-fill" style="width: {uploadProgress}%"></div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="upload-content">
        <div class="upload-icon">📷</div>
        <h3>Upload Photos</h3>
        <p>Drag and drop photos here, or click to select files</p>
        <p class="file-info">
          Supports: JPEG, PNG, GIF, WebP<br>
          Maximum size: 10MB per file<br>
          <small>Photos will be automatically compressed and resized</small>
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .photo-uploader {
    width: 100%;
  }

  .upload-area {
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f9fafb;
  }

  .upload-area:hover:not(.disabled):not(.uploading) {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .upload-area.drag-active {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: scale(1.02);
  }

  .upload-area.uploading {
    border-color: #10b981;
    background: #f0fdf4;
    cursor: not-allowed;
  }

  .upload-area.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .upload-content h3 {
    margin: 1rem 0 0.5rem 0;
    color: #374151;
    font-size: 1.25rem;
  }

  .upload-content p {
    color: #6b7280;
    margin: 0.5rem 0;
  }

  .upload-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .file-info {
    font-size: 0.875rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .file-info small {
    color: #9ca3af;
    font-style: italic;
  }

  .upload-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .progress-bar {
    width: 100%;
    max-width: 200px;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #10b981;
    transition: width 0.3s ease;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .hidden {
    display: none;
  }
</style>
