<script lang="ts">
	import { createMemorialAndUser, getMemorialByCreatorUid } from '$lib/firebase/memorial';
	import { signInUser } from '$lib/firebase/auth';
	import { sendPasswordEmail } from '$lib/services/email';
	import { generateMemorialSlug } from '$lib/utils/password';
	import { goto } from '$app/navigation';
	
	export let prefilledName = '';
	let lovedOneName = prefilledName;
	let creatorName = '';
	let creatorPhone = '';
	let creatorEmail = '';
	let loading = false;
	let error = '';
	let step = 1; // 1: form, 2: processing, 3: success
	let generatedUrl = '';
	let generatedPassword = '';

	$: previewUrl = lovedOneName ? generateMemorialSlug(lovedOneName) : '';

	// Initialize with prefilled name if provided
	$: if (prefilledName && !lovedOneName) {
		lovedOneName = prefilledName;
	}

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
			try {
				await sendPasswordEmail(
					creatorEmail, 
					result.generatedPassword, 
					fullUrl, 
					lovedOneName
				);
			} catch (emailError) {
				console.warn('Email sending failed, but continuing with registration:', emailError);
				// Don't fail the entire process if email fails
			}
			
			// Sign in the user automatically
			await signInUser(creatorEmail, result.generatedPassword);
			
			step = 3;
			
			// Redirect to memorial page after 3 seconds
			setTimeout(() => {
				goto(`/${result.customUrl}`);
			}, 3000);
			
		} catch (err: any) {
			console.error('Registration error:', err);
			
			// Handle specific Firebase errors with detailed explanations
			if (err.message.includes('email-already-in-use')) {
				error = `An account with this email address already exists. This usually means:

• You've already created a memorial with this email
• Someone else has used this email address

What you can do:
• Try logging in with this email instead
• Use a different email address
• Contact support if you believe this is an error

Please check your email for any previous memorial creation confirmations.`;
			} else if (err.message.includes('permission-denied')) {
				error = `We're having trouble accessing our database right now. This could be due to:

• Temporary server issues
• Network connectivity problems
• Security rule configuration

Please try again in a few moments. If the problem persists, contact support.`;
			} else if (err.message.includes('network-request-failed')) {
				error = `Network connection issue detected:

• Check your internet connection
• Try refreshing the page
• If using a VPN, try disabling it temporarily

Please try again once your connection is stable.`;
			} else if (err.message.includes('Failed to send email')) {
				error = `Your memorial was created successfully, but we couldn't send the password email:

• Your account is ready and you should be logged in automatically
• Please save your password: ${generatedPassword || 'Check browser console'}
• You can change your password in your profile settings

Don't worry - your memorial is safe and accessible!`;
			} else {
				error = `Something went wrong while creating your memorial:

${err.message || 'Unknown error occurred'}

What you can try:
• Refresh the page and try again
• Check that all information is correct
• Try using a different email address
• Contact support if the problem continues

We apologize for the inconvenience.`;
			}
			step = 1;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto p-6">
	<div class="card p-8">
		{#if step === 1}
			<div class="text-center mb-8">
				<h1 class="h1 mb-4">Create a Memorial</h1>
				<p class="text-secondary">Honor your loved one with a beautiful memorial page. You'll become the memorial owner.</p>
			</div>
			
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				{#if error}
					<aside class="alert variant-filled-error">
						<div class="alert-message">
							<h3 class="h3">Error</h3>
							<p>{error}</p>
						</div>
					</aside>
				{/if}
				
				<div>
					<label for="lovedOneName" class="label">
						<span>Loved One's Name *</span>
					</label>
					<input
						id="lovedOneName"
						type="text"
						bind:value={lovedOneName}
						class="input"
						placeholder="Enter their full name"
						required
						disabled={loading}
					/>
					{#if previewUrl}
						<div class="mt-2 p-3 bg-surface-100-800-token rounded-container-token">
							<span class="text-sm font-medium">Memorial URL:</span>
							<span class="text-sm text-primary-500">tributestream.com/{previewUrl}</span>
						</div>
					{/if}
				</div>
				
				<div>
					<label for="creatorName" class="label">
						<span>Your Name *</span>
					</label>
					<input
						id="creatorName"
						type="text"
						bind:value={creatorName}
						class="input"
						placeholder="Enter your full name"
						required
						disabled={loading}
					/>
				</div>
				
				<div>
					<label for="creatorPhone" class="label">
						<span>Your Phone Number *</span>
					</label>
					<input
						id="creatorPhone"
						type="tel"
						bind:value={creatorPhone}
						class="input"
						placeholder="(555) 123-4567"
						required
						disabled={loading}
					/>
				</div>
				
				<div>
					<label for="creatorEmail" class="label">
						<span>Your Email Address *</span>
					</label>
					<input
						id="creatorEmail"
						type="email"
						bind:value={creatorEmail}
						class="input"
						placeholder="your.email@example.com"
						required
						disabled={loading}
					/>
					<div class="text-sm text-secondary mt-1">
						We'll send your account password to this email address
					</div>
				</div>
				
				<button type="submit" class="btn variant-filled-primary w-full" disabled={loading}>
					{#if loading}
						<span class="animate-pulse">Creating Memorial...</span>
					{:else}
						Create Memorial
					{/if}
				</button>
			</form>
			
		{:else if step === 2}
			<div class="text-center py-12">
				<div class="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-6"></div>
				<h2 class="h2 mb-8">Creating Your Memorial</h2>
				<div class="space-y-4">
					<div class="flex items-center justify-center space-x-2">
						<span class="text-success-500">✓</span>
						<span>Generating custom URL</span>
					</div>
					<div class="flex items-center justify-center space-x-2">
						<span class="text-success-500">✓</span>
						<span>Creating your account</span>
					</div>
					<div class="flex items-center justify-center space-x-2 text-primary-500">
						<span>📧</span>
						<span class="animate-pulse">Sending password email</span>
					</div>
					<div class="flex items-center justify-center space-x-2 text-secondary">
						<span>🔐</span>
						<span>Signing you in</span>
					</div>
				</div>
			</div>
			
		{:else if step === 3}
			<div class="text-center py-12">
				<div class="text-6xl mb-6">🎉</div>
				<h2 class="h2 mb-8">Memorial Created Successfully!</h2>
				<div class="space-y-4 mb-8">
					<p><strong>Memorial for:</strong> {lovedOneName}</p>
					<p><strong>Your URL:</strong> <code class="code">tributestream.com/{generatedUrl}</code></p>
					<p><strong>Password sent to:</strong> {creatorEmail}</p>
				</div>
				<p class="text-secondary animate-pulse">Redirecting you to your memorial page...</p>
			</div>
		{/if}
	</div>
</div>

