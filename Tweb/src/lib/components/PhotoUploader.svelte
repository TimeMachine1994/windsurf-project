<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let uploading = false;
	export let maxFiles = 10;
	export let maxFileSize = 10 * 1024 * 1024; // 10MB

	const dispatch = createEventDispatcher<{
		upload: { files: File[] };
	}>();

	let fileInput: HTMLInputElement;
	let dragActive = false;
	let uploadQueue: File[] = [];

	const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			processFiles(Array.from(target.files));
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
		
		if (event.dataTransfer?.files) {
			processFiles(Array.from(event.dataTransfer.files));
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		// Only set dragActive to false if we're leaving the drop zone entirely
		if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
			dragActive = false;
		}
	}

	function processFiles(files: File[]) {
		const validFiles: File[] = [];
		const errors: string[] = [];

		for (const file of files) {
			// Check file type
			if (!acceptedTypes.includes(file.type)) {
				errors.push(`${file.name}: Invalid file type. Please use JPEG, PNG, GIF, or WebP.`);
				continue;
			}

			// Check file size
			if (file.size > maxFileSize) {
				errors.push(`${file.name}: File too large. Maximum size is ${formatFileSize(maxFileSize)}.`);
				continue;
			}

			validFiles.push(file);
		}

		// Check total file count
		if (validFiles.length > maxFiles) {
			errors.push(`Too many files selected. Maximum is ${maxFiles} files at once.`);
			return;
		}

		if (errors.length > 0) {
			alert('Upload errors:\n' + errors.join('\n'));
		}

		if (validFiles.length > 0) {
			uploadQueue = validFiles;
			dispatch('upload', { files: validFiles });
		}

		// Reset file input
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function openFileDialog() {
		fileInput?.click();
	}
</script>

<div class="photo-uploader">
	<div
		class="upload-zone"
		class:drag-active={dragActive}
		class:uploading
		on:drop={handleDrop}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		role="button"
		tabindex="0"
		on:click={openFileDialog}
		on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
	>
		<input
			bind:this={fileInput}
			type="file"
			multiple
			accept={acceptedTypes.join(',')}
			on:change={handleFileSelect}
			style="display: none;"
		/>

		{#if uploading}
			<div class="upload-status">
				<div class="spinner"></div>
				<h3>Uploading Photos...</h3>
				<p>Please wait while your photos are being uploaded</p>
			</div>
		{:else}
			<div class="upload-content">
				<div class="upload-icon">
					{#if dragActive}
						📥
					{:else}
						📷
					{/if}
				</div>
				<h3>
					{#if dragActive}
						Drop photos here
					{:else}
						Upload Photos
					{/if}
				</h3>
				<p>
					{#if dragActive}
						Release to upload your photos
					{:else}
						Drag and drop photos here, or click to browse
					{/if}
				</p>
				<div class="upload-info">
					<small>
						Supports JPEG, PNG, GIF, WebP • Max {maxFiles} files • Max {formatFileSize(maxFileSize)} each
					</small>
				</div>
			</div>
		{/if}
	</div>

	{#if uploadQueue.length > 0 && !uploading}
		<div class="upload-queue">
			<h4>Ready to upload ({uploadQueue.length} files):</h4>
			<div class="queue-list">
				{#each uploadQueue as file}
					<div class="queue-item">
						<span class="file-name">{file.name}</span>
						<span class="file-size">{formatFileSize(file.size)}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.photo-uploader {
		width: 100%;
	}

	.upload-zone {
		border: 2px dashed #ccc;
		border-radius: 12px;
		padding: 3rem 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		background: #fafafa;
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.upload-zone:hover {
		border-color: #007bff;
		background: #f8f9ff;
	}

	.upload-zone.drag-active {
		border-color: #007bff;
		background: #e3f2fd;
		transform: scale(1.02);
	}

	.upload-zone.uploading {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.upload-content {
		width: 100%;
	}

	.upload-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		transition: transform 0.2s ease;
	}

	.upload-zone:hover .upload-icon {
		transform: scale(1.1);
	}

	.upload-zone h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.5rem;
	}

	.upload-zone p {
		margin: 0 0 1rem 0;
		color: #666;
		font-size: 1rem;
	}

	.upload-info {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.upload-info small {
		color: #888;
		font-size: 0.85rem;
	}

	.upload-status {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #007bff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.upload-queue {
		margin-top: 1.5rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		border: 1px solid #dee2e6;
	}

	.upload-queue h4 {
		margin: 0 0 1rem 0;
		color: #495057;
		font-size: 1rem;
	}

	.queue-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.queue-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: white;
		border-radius: 4px;
		border: 1px solid #e9ecef;
	}

	.file-name {
		flex: 1;
		font-weight: 500;
		color: #495057;
		word-break: break-word;
	}

	.file-size {
		font-size: 0.85rem;
		color: #6c757d;
		margin-left: 1rem;
	}

	@media (max-width: 768px) {
		.upload-zone {
			padding: 2rem 1rem;
			min-height: 150px;
		}

		.upload-icon {
			font-size: 2.5rem;
		}

		.upload-zone h3 {
			font-size: 1.25rem;
		}

		.upload-zone p {
			font-size: 0.9rem;
		}

		.queue-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}

		.file-size {
			margin-left: 0;
		}
	}
</style>
