<script lang="ts">
	import { goto } from '$app/navigation';
	
	export let prefilledName = '';
	let lovedOneName = prefilledName;
	let creatorName = '';
	let creatorPhone = '';
	let creatorEmail = '';
	let dateOfBirth = '';
	let dateOfPassing = '';
	let biography = '';
	let loading = false;
	let error = '';
	let step = 1; // 1: form, 2: processing, 3: success
	let generatedUrl = '';
	let generatedPassword = '';

	// Initialize with prefilled name if provided
	$: if (prefilledName && !lovedOneName) {
		lovedOneName = prefilledName;
	}

	// Generate preview URL
	$: previewUrl = lovedOneName ? `celebration-of-life-for-${lovedOneName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}` : '';

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
			// Create memorial and owner account
			const response = await fetch('/api/memorials/create-with-owner', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					lovedOneName,
					creatorName,
					creatorPhone,
					creatorEmail,
					dateOfBirth: dateOfBirth || null,
					dateOfPassing: dateOfPassing || null,
					biography: biography || null
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Memorial creation failed');
			}
			
			generatedUrl = result.customUrl;
			generatedPassword = result.generatedPassword;
			
			step = 3;
			
			// Redirect to memorial page after 3 seconds
			setTimeout(() => {
				goto(`/${result.customUrl}`);
			}, 3000);
			
		} catch (err: any) {
			console.error('Memorial creation error:', err);
			
			// Handle specific errors with detailed explanations
			if (err.message.includes('email-already-in-use') || err.message.includes('already exists')) {
				error = `An account with this email address already exists. This usually means:

• You've already created a memorial with this email
• Someone else has used this email address

What you can do:
• Try logging in with this email instead
• Use a different email address
• Contact support if you believe this is an error

Please check your email for any previous memorial creation confirmations.`;
			} else if (err.message.includes('url-already-exists')) {
				error = `A memorial with a similar name already exists. Please try:

• Adding the person's middle name or initial
• Including birth/death years in the name
• Using a slightly different variation of the name

This helps ensure each memorial has a unique web address.`;
			} else if (err.message.includes('network')) {
				error = `Network connection issue detected:

• Check your internet connection
• Try refreshing the page
• If using a VPN, try disabling it temporarily

Please try again once your connection is stable.`;
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
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
		{#if step === 1}
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold mb-4">Create a Memorial</h1>
				<p class="text-gray-600">Honor your loved one with a beautiful memorial page. You'll become the memorial owner with full access.</p>
			</div>
			
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				{#if error}
					<div class="bg-red-50 border border-red-200 rounded-lg p-4">
						<div class="flex items-start">
							<div class="text-red-600 mr-3">
								<svg class="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
								</svg>
							</div>
							<div>
								<h3 class="font-semibold text-red-800">Error</h3>
								<pre class="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
							</div>
						</div>
					</div>
				{/if}
				
				<div>
					<label for="lovedOneName" class="block text-sm font-medium text-gray-700 mb-1">
						Loved One's Name *
					</label>
					<input
						id="lovedOneName"
						type="text"
						bind:value={lovedOneName}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Enter their full name"
						required
						disabled={loading}
					/>
					{#if previewUrl}
						<div class="mt-2 p-3 bg-gray-50 rounded-lg">
							<span class="text-sm font-medium">Memorial URL:</span>
							<span class="text-sm text-blue-600">tributestream.com/memorial/{previewUrl}</span>
						</div>
					{/if}
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="dateOfBirth" class="block text-sm font-medium text-gray-700 mb-1">
							Date of Birth (Optional)
						</label>
						<input
							id="dateOfBirth"
							type="date"
							bind:value={dateOfBirth}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={loading}
						/>
					</div>
					
					<div>
						<label for="dateOfPassing" class="block text-sm font-medium text-gray-700 mb-1">
							Date of Passing (Optional)
						</label>
						<input
							id="dateOfPassing"
							type="date"
							bind:value={dateOfPassing}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={loading}
						/>
					</div>
				</div>

				<div>
					<label for="biography" class="block text-sm font-medium text-gray-700 mb-1">
						Biography (Optional)
					</label>
					<textarea
						id="biography"
						bind:value={biography}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Share their life story, achievements, and what made them special..."
						rows="4"
						disabled={loading}
					></textarea>
				</div>

				<div class="border-t border-gray-200 pt-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Your Information (Memorial Owner)</h3>
					
					<div>
						<label for="creatorName" class="block text-sm font-medium text-gray-700 mb-1">
							Your Name *
						</label>
						<input
							id="creatorName"
							type="text"
							bind:value={creatorName}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your full name"
							required
							disabled={loading}
						/>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
						<div>
							<label for="creatorPhone" class="block text-sm font-medium text-gray-700 mb-1">
								Your Phone Number *
							</label>
							<input
								id="creatorPhone"
								type="tel"
								bind:value={creatorPhone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="(555) 123-4567"
								required
								disabled={loading}
							/>
						</div>
						
						<div>
							<label for="creatorEmail" class="block text-sm font-medium text-gray-700 mb-1">
								Your Email Address *
							</label>
							<input
								id="creatorEmail"
								type="email"
								bind:value={creatorEmail}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="your.email@example.com"
								required
								disabled={loading}
							/>
						</div>
					</div>
					
					<div class="text-sm text-gray-600 mt-2">
						We'll create your owner account and send login credentials to this email address
					</div>
				</div>
				
				<button type="submit" class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
					{#if loading}
						<span class="flex items-center justify-center">
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Creating Memorial...
						</span>
					{:else}
						Create Memorial
					{/if}
				</button>
			</form>
			
		{:else if step === 2}
			<div class="text-center py-12">
				<div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
				<h2 class="text-2xl font-bold mb-8">Creating Your Memorial</h2>
				<div class="space-y-4">
					<div class="flex items-center justify-center space-x-2">
						<span class="text-green-500">✓</span>
						<span>Generating custom URL</span>
					</div>
					<div class="flex items-center justify-center space-x-2">
						<span class="text-green-500">✓</span>
						<span>Creating your owner account</span>
					</div>
					<div class="flex items-center justify-center space-x-2 text-blue-500">
						<span>📧</span>
						<span class="animate-pulse">Sending credentials email</span>
					</div>
					<div class="flex items-center justify-center space-x-2 text-gray-500">
						<span>🔐</span>
						<span>Signing you in</span>
					</div>
				</div>
			</div>
			
		{:else if step === 3}
			<div class="text-center py-12">
				<div class="text-6xl mb-6">🎉</div>
				<h2 class="text-2xl font-bold mb-8">Memorial Created Successfully!</h2>
				<div class="space-y-4 mb-8">
					<p><strong>Memorial for:</strong> {lovedOneName}</p>
					<p><strong>Your URL:</strong> <code class="bg-gray-100 px-2 py-1 rounded">tributestream.com/{generatedUrl}</code></p>
					<p><strong>Login credentials sent to:</strong> {creatorEmail}</p>
					{#if generatedPassword}
						<p><strong>Your password:</strong> <code class="bg-gray-100 px-2 py-1 rounded">{generatedPassword}</code></p>
						<p class="text-sm text-gray-600">(Please save this password securely)</p>
					{/if}
				</div>
				<p class="text-gray-600 animate-pulse">Redirecting you to your memorial page...</p>
			</div>
		{/if}
	</div>
</div>
