<script lang="ts">
	import { createMemorialAndUser } from '$lib/firebase/memorial';
	import { signInUser } from '$lib/firebase/auth';
	import { sendPasswordEmail } from '$lib/services/email';
	import { generateMemorialSlug } from '$lib/utils/password';
	import { goto } from '$app/navigation';
	
	let lovedOneName = '';
	let creatorName = '';
	let creatorPhone = '';
	let creatorEmail = '';
	let loading = false;
	let error = '';
	let step = 1; // 1: form, 2: processing, 3: success
	let generatedUrl = '';
	let generatedPassword = '';

	$: previewUrl = lovedOneName ? generateMemorialSlug(lovedOneName) : '';

	async function handleSubmit() {
		error = '';
		
		// Validation
		if (!lovedOneName || !creatorName || !creatorPhone || !creatorEmail) {
			error = 'Please fill in all required fields';
			return;
		}
		
		if (!creatorEmail.includes('@')) {
			error = 'Please enter a valid email address';
			return;
		}
		
		loading = true;
		step = 2;
		
		try {
			// Create memorial and user account
			const result = await createMemorialAndUser({
				lovedOneName,
				creatorName,
				creatorPhone,
				creatorEmail
			});
			
			generatedUrl = result.customUrl;
			generatedPassword = result.generatedPassword;
			
			// Send password email
			const fullUrl = `${window.location.origin}/${result.customUrl}`;
			await sendPasswordEmail(
				creatorEmail, 
				result.generatedPassword, 
				fullUrl, 
				lovedOneName
			);
			
			// Sign in the user automatically
			await signInUser(creatorEmail, result.generatedPassword);
			
			step = 3;
			
			// Redirect to memorial page after 3 seconds
			setTimeout(() => {
				goto(`/${result.customUrl}`);
			}, 3000);
			
		} catch (err: any) {
			error = err.message;
			step = 1;
		} finally {
			loading = false;
		}
	}
</script>

<div class="memorial-form">
	<div class="form-container">
		{#if step === 1}
			<div class="form-header">
				<h1>Create a Memorial</h1>
				<p class="subtitle">Honor your loved one with a beautiful memorial page. You'll become the memorial owner.</p>
			</div>
			
			<form on:submit|preventDefault={handleSubmit}>
				{#if error}
					<div class="error-message">
						<p>{error}</p>
					</div>
				{/if}
				
				<div class="form-group">
					<label for="lovedOneName">Loved One's Name *</label>
					<input
						id="lovedOneName"
						type="text"
						bind:value={lovedOneName}
						placeholder="Enter their full name"
						required
						disabled={loading}
					/>
					{#if previewUrl}
						<div class="url-preview">
							<span class="preview-label">Memorial URL:</span>
							<span class="preview-url">yoursite.com/{previewUrl}</span>
						</div>
					{/if}
				</div>
				
				<div class="form-group">
					<label for="creatorName">Your Name *</label>
					<input
						id="creatorName"
						type="text"
						bind:value={creatorName}
						placeholder="Enter your full name"
						required
						disabled={loading}
					/>
				</div>
				
				<div class="form-group">
					<label for="creatorPhone">Your Phone Number *</label>
					<input
						id="creatorPhone"
						type="tel"
						bind:value={creatorPhone}
						placeholder="(555) 123-4567"
						required
						disabled={loading}
					/>
				</div>
				
				<div class="form-group">
					<label for="creatorEmail">Your Email Address *</label>
					<input
						id="creatorEmail"
						type="email"
						bind:value={creatorEmail}
						placeholder="your.email@example.com"
						required
						disabled={loading}
					/>
					<div class="help-text">
						We'll send your account password to this email address
					</div>
				</div>
				
				<button type="submit" class="btn btn-primary" disabled={loading}>
					{#if loading}
						Creating Memorial...
					{:else}
						Create Memorial
					{/if}
				</button>
			</form>
			
		{:else if step === 2}
			<div class="processing">
				<div class="spinner"></div>
				<h2>Creating Your Memorial</h2>
				<div class="progress-steps">
					<div class="step completed">✓ Generating custom URL</div>
					<div class="step completed">✓ Creating your account</div>
					<div class="step active">📧 Sending password email</div>
					<div class="step">🔐 Signing you in</div>
				</div>
			</div>
			
		{:else if step === 3}
			<div class="success">
				<div class="success-icon">🎉</div>
				<h2>Memorial Created Successfully!</h2>
				<div class="success-details">
					<p><strong>Memorial for:</strong> {lovedOneName}</p>
					<p><strong>Your URL:</strong> <code>yoursite.com/{generatedUrl}</code></p>
					<p><strong>Password sent to:</strong> {creatorEmail}</p>
				</div>
				<p class="redirect-notice">Redirecting you to your memorial page...</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.memorial-form {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 90vh;
		padding: 2rem 1rem;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	}
	
	.form-container {
		background: white;
		padding: 2.5rem;
		border-radius: 1rem;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 500px;
	}
	
	.form-header {
		text-align: center;
		margin-bottom: 2rem;
	}
	
	h1 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 2rem;
		font-weight: 700;
	}
	
	.subtitle {
		color: #6b7280;
		margin: 0;
		font-size: 1rem;
	}
	
	.form-group {
		margin-bottom: 1.5rem;
	}
	
	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #374151;
		font-weight: 600;
		font-size: 0.875rem;
	}
	
	input {
		width: 100%;
		padding: 0.875rem;
		border: 2px solid #e5e7eb;
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: all 0.2s ease;
	}
	
	input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
	
	input:disabled {
		background-color: #f9fafb;
		cursor: not-allowed;
	}
	
	.url-preview {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}
	
	.preview-label {
		color: #0369a1;
		font-weight: 500;
	}
	
	.preview-url {
		color: #0c4a6e;
		font-family: monospace;
		font-weight: 600;
	}
	
	.help-text {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.btn {
		width: 100%;
		padding: 1rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: 1rem;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
	}
	
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	
	.error-message {
		background: #fef2f2;
		border: 2px solid #fecaca;
		color: #dc2626;
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
	}
	
	.error-message p {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 500;
	}
	
	.processing {
		text-align: center;
	}
	
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e5e7eb;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1.5rem;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.processing h2 {
		color: #1f2937;
		margin-bottom: 1.5rem;
	}
	
	.progress-steps {
		text-align: left;
		max-width: 300px;
		margin: 0 auto;
	}
	
	.step {
		padding: 0.5rem 0;
		color: #6b7280;
		font-size: 0.875rem;
	}
	
	.step.completed {
		color: #059669;
		font-weight: 500;
	}
	
	.step.active {
		color: #667eea;
		font-weight: 500;
	}
	
	.success {
		text-align: center;
	}
	
	.success-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}
	
	.success h2 {
		color: #059669;
		margin-bottom: 1.5rem;
	}
	
	.success-details {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		padding: 1.5rem;
		border-radius: 0.5rem;
		margin: 1.5rem 0;
		text-align: left;
	}
	
	.success-details p {
		margin: 0.5rem 0;
		color: #166534;
	}
	
	.success-details code {
		background: #dcfce7;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-family: monospace;
		font-weight: 600;
	}
	
	.redirect-notice {
		color: #6b7280;
		font-size: 0.875rem;
		margin-top: 1.5rem;
		font-style: italic;
	}
</style>
