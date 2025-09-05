<script lang="ts">
	import { goto } from '$app/navigation';
	import { user } from '$lib/services/auth-mock';
	
	export let prefilledName = '';
	let lovedOneName = prefilledName;
	let creatorName = '';
	let creatorPhone = '';
	let creatorEmail = '';
	let dateOfBirth = '';
	let dateOfPassing = '';
	let biography = '';
	let serviceDate = '';
	let serviceStartTime = '';
	let serviceEndTime = '';
	let serviceDays = 1;
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
			// Create memorial with funeral director info
			const response = await fetch('/api/memorials/create-with-funeral-director', {
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
					biography: biography || null,
					serviceDate: serviceDate || null,
					serviceStartTime: serviceStartTime || null,
					serviceEndTime: serviceEndTime || null,
					serviceDays: serviceDays || 1,
					funeralDirectorId: $user?._id
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

• The family has already created a memorial with this email
• Someone else has used this email address

What you can do:
• Try using a different email address for the family
• Contact support if you believe this is an error
• Check with the family about existing accounts

Please verify the email address with the family.`;
			} else if (err.message.includes('url-already-exists')) {
				error = `A memorial with a similar name already exists. Please try:

• Adding the person's middle name or initial
• Including birth/death years in the name
• Using a slightly different variation of the name

The system will automatically handle duplicates, but a unique name helps families find the right memorial.`;
			} else if (err.message.includes('network') || err.message.includes('fetch')) {
				error = `Network connection error. Please check:

• Your internet connection is stable
• Try refreshing the page and submitting again
• If the problem persists, contact technical support

Your memorial information has been saved locally and won't be lost.`;
			} else {
				error = `Memorial creation failed: ${err.message}

Please try again. If the problem continues:
• Contact technical support at support@tributestream.com
• Call 1-800-TRIBUTE for immediate assistance
• Reference error: Memorial creation failure

We apologize for the inconvenience and will resolve this quickly.`;
			}
			
			step = 1;
		} finally {
			loading = false;
		}
	}
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
	<div class="mb-8">
		<h2 class="text-2xl font-bold text-gray-900 mb-2">Create Memorial for Family</h2>
		<p class="text-gray-600">
			Create a memorial on behalf of a family with enhanced funeral home services.
		</p>
		{#if $user}
			<div class="mt-4 p-4 bg-blue-50 rounded-lg">
				<p class="text-blue-800">
					<strong>Funeral Home:</strong> {$user.funeralHomeName}<br>
					<strong>Director:</strong> {$user.displayName || $user.name}
				</p>
			</div>
		{/if}
	</div>

	{#if step === 1}
		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			{#if error}
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					<div class="flex">
						<span class="text-red-400 text-xl mr-3">⚠️</span>
						<div>
							<h3 class="text-sm font-medium text-red-800 mb-2">Error Creating Memorial</h3>
							<div class="text-sm text-red-700 whitespace-pre-line">{error}</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="border-b border-gray-200 pb-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Memorial Information</h3>
				
				<div>
					<label for="lovedOneName" class="block text-sm font-medium text-gray-700 mb-1">
						Name of Loved One *
					</label>
					<input
						id="lovedOneName"
						type="text"
						bind:value={lovedOneName}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Enter the full name of your loved one"
						required
						disabled={loading}
					/>
					{#if previewUrl}
						<p class="text-sm text-gray-500 mt-1">
							Memorial URL: <code class="bg-gray-100 px-1 rounded">tributestream.com/{previewUrl}</code>
						</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

				<div class="mt-4">
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
			</div>

			<!-- Service Information -->
			<div class="border-b border-gray-200 pb-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Service Information (Optional)</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="serviceDate" class="block text-sm font-medium text-gray-700 mb-1">
							Service Date
						</label>
						<input
							id="serviceDate"
							type="date"
							bind:value={serviceDate}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={loading}
						/>
					</div>
					
					<div>
						<label for="serviceStartTime" class="block text-sm font-medium text-gray-700 mb-1">
							Start Time
						</label>
						<input
							id="serviceStartTime"
							type="time"
							bind:value={serviceStartTime}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={loading}
						/>
					</div>
					
					<div>
						<label for="serviceEndTime" class="block text-sm font-medium text-gray-700 mb-1">
							End Time
						</label>
						<input
							id="serviceEndTime"
							type="time"
							bind:value={serviceEndTime}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={loading}
						/>
					</div>
				</div>

				<div class="mt-4">
					<label for="serviceDays" class="block text-sm font-medium text-gray-700 mb-1">
						Memorial Duration (Days)
					</label>
					<select
						id="serviceDays"
						bind:value={serviceDays}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						disabled={loading}
					>
						<option value={1}>1 Day</option>
						<option value={2}>2 Days</option>
						<option value={3}>3 Days</option>
						<option value={7}>1 Week</option>
						<option value={30}>1 Month</option>
						<option value={365}>1 Year</option>
					</select>
					<p class="text-sm text-gray-500 mt-1">
						How long should the memorial remain prominently featured?
					</p>
				</div>
			</div>

			<!-- Family Contact Information -->
			<div class="border-b border-gray-200 pb-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Family Contact Information</h3>
				
				<div>
					<label for="creatorName" class="block text-sm font-medium text-gray-700 mb-1">
						Primary Family Contact Name *
					</label>
					<input
						id="creatorName"
						type="text"
						bind:value={creatorName}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Enter the primary family contact's full name"
						required
						disabled={loading}
					/>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
					<div>
						<label for="creatorPhone" class="block text-sm font-medium text-gray-700 mb-1">
							Phone Number *
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
							Email Address *
						</label>
						<input
							id="creatorEmail"
							type="email"
							bind:value={creatorEmail}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="family@email.com"
							required
							disabled={loading}
						/>
						<p class="text-sm text-gray-500 mt-1">
							The family will receive login credentials at this email
						</p>
					</div>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
			>
				{#if loading}
					<span class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
					Creating Memorial...
				{:else}
					Create Memorial for Family
				{/if}
			</button>
		</form>
		
	{:else if step === 2}
		<div class="text-center py-12">
			<div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
			<h2 class="text-2xl font-bold mb-8">Creating Memorial for Family</h2>
			<div class="space-y-4">
				<div class="flex items-center justify-center space-x-2">
					<span class="text-green-500">✓</span>
					<span>Generating custom URL</span>
				</div>
				<div class="flex items-center justify-center space-x-2">
					<span class="text-green-500">✓</span>
					<span>Creating family owner account</span>
				</div>
				<div class="flex items-center justify-center space-x-2">
					<span class="text-green-500">✓</span>
					<span>Linking to funeral home</span>
				</div>
				<div class="flex items-center justify-center space-x-2 text-blue-500">
					<span>📧</span>
					<span class="animate-pulse">Sending credentials to family</span>
				</div>
			</div>
		</div>
		
	{:else if step === 3}
		<div class="text-center py-12">
			<div class="text-6xl mb-6">🎉</div>
			<h2 class="text-2xl font-bold mb-8">Memorial Created Successfully!</h2>
			<div class="space-y-4 mb-8">
				<p><strong>Memorial for:</strong> {lovedOneName}</p>
				<p><strong>Memorial URL:</strong> <code class="bg-gray-100 px-2 py-1 rounded">tributestream.com/{generatedUrl}</code></p>
				<p><strong>Family login sent to:</strong> {creatorEmail}</p>
				<p><strong>Family password:</strong> <code class="bg-gray-100 px-2 py-1 rounded">{generatedPassword}</code></p>
				<p class="text-sm text-gray-600">(Family can use this to manage their memorial)</p>
				{#if $user}
					<div class="bg-blue-50 p-4 rounded-lg mt-6">
						<p class="text-blue-800">
							<strong>Funeral Home:</strong> {$user.funeralHomeName}<br>
							<strong>Created by:</strong> {$user.displayName || $user.name}
						</p>
					</div>
				{/if}
			</div>
			<p class="text-gray-600 animate-pulse">Taking you to the memorial page...</p>
		</div>
	{/if}
</div>
