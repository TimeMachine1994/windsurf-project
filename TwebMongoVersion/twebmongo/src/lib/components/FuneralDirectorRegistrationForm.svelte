<script lang="ts">
	import { goto } from '$app/navigation';
	
	let email = '';
	let password = '';
	let confirmPassword = '';
	let displayName = '';
	let personalPhone = '';
	let funeralHomeName = '';
	let funeralHomeAddress = '';
	let funeralHomeEmail = '';
	let funeralHomePhone = '';
	let loading = false;
	let error = '';
	let success = false;

	async function handleRegister() {
		error = '';
		
		// Basic validation
		if (!email || !password || !confirmPassword || !displayName || !funeralHomeName || 
			!funeralHomeAddress || !funeralHomeEmail || !funeralHomePhone || !personalPhone) {
			error = 'Please fill in all required fields';
			return;
		}
		
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		
		if (password.length < 6) {
			error = 'Password must be at least 6 characters long';
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			error = 'Please enter a valid email address';
			return;
		}

		if (!emailRegex.test(funeralHomeEmail)) {
			error = 'Please enter a valid funeral home email address';
			return;
		}

		// Phone validation (basic)
		const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
		if (!phoneRegex.test(funeralHomePhone.replace(/[\s\-\(\)]/g, ''))) {
			error = 'Please enter a valid funeral home phone number';
			return;
		}

		if (!phoneRegex.test(personalPhone.replace(/[\s\-\(\)]/g, ''))) {
			error = 'Please enter a valid personal phone number';
			return;
		}
		
		loading = true;
		
		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					displayName,
					phone: personalPhone,
					role: 'FuneralDirector',
					funeralHomeName,
					funeralHomeAddress,
					funeralHomeEmail,
					funeralHomePhone,
					personalPhone
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Registration failed');
			}

			success = true;
			// Clear form
			email = '';
			password = '';
			confirmPassword = '';
			displayName = '';
			funeralHomeName = '';
			funeralHomeAddress = '';
			funeralHomeEmail = '';
			funeralHomePhone = '';
			personalPhone = '';

		} catch (err: any) {
			console.error('Registration error:', err);
			if (err.message.includes('email-already-in-use') || err.message.includes('already exists')) {
				error = 'An account with this email already exists. Please use a different email or try signing in.';
			} else if (err.message.includes('weak-password')) {
				error = 'Password is too weak. Please choose a stronger password.';
			} else if (err.message.includes('invalid-email')) {
				error = 'Please enter a valid email address.';
			} else {
				error = err.message || 'Registration failed. Please try again.';
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto p-6">
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
		<h2 class="text-2xl font-bold text-center mb-2">Funeral Director Registration</h2>
		<p class="text-center text-gray-600 mb-8">
			Register to join our network of professional funeral directors. Your account will require admin approval before activation.
		</p>
		
		{#if success}
			<div class="bg-green-50 border border-green-200 rounded-lg p-6">
				<div class="flex items-start">
					<div class="text-green-600 mr-3">
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					</div>
					<div>
						<h3 class="font-semibold text-green-800 mb-2">Registration Submitted!</h3>
						<p class="text-sm text-green-700 mb-4">Your funeral director account has been created and is pending admin approval. You will receive an email notification once your account is approved and ready to use.</p>
						<a href="/auth/login" class="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">Sign In</a>
					</div>
				</div>
			</div>
		{:else}
			<form on:submit|preventDefault={handleRegister} class="space-y-6">
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
								<p class="text-sm text-red-700">{error}</p>
							</div>
						</div>
					</div>
				{/if}
				
				<!-- Personal Information Section -->
				<div class="space-y-4">
					<h3 class="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2">Personal Information</h3>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
								Full Name *
							</label>
							<input
								id="displayName"
								type="text"
								bind:value={displayName}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter your full name"
								required
								disabled={loading}
							/>
						</div>
						
						<div>
							<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
								Personal Email *
							</label>
							<input
								id="email"
								type="email"
								bind:value={email}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter your personal email"
								required
								disabled={loading}
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="personalPhone" class="block text-sm font-medium text-gray-700 mb-1">
								Personal Phone *
							</label>
							<input
								id="personalPhone"
								type="tel"
								bind:value={personalPhone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter your personal phone"
								required
								disabled={loading}
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
								Password *
							</label>
							<input
								id="password"
								type="password"
								bind:value={password}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter your password"
								required
								disabled={loading}
							/>
						</div>
						
						<div>
							<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
								Confirm Password *
							</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Confirm your password"
								required
								disabled={loading}
							/>
						</div>
					</div>
				</div>

				<!-- Funeral Home Information Section -->
				<div class="space-y-4">
					<h3 class="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2">Funeral Home Information</h3>
					
					<div>
						<label for="funeralHomeName" class="block text-sm font-medium text-gray-700 mb-1">
							Funeral Home Name *
						</label>
						<input
							id="funeralHomeName"
							type="text"
							bind:value={funeralHomeName}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter funeral home name"
							required
							disabled={loading}
						/>
					</div>

					<div>
						<label for="funeralHomeAddress" class="block text-sm font-medium text-gray-700 mb-1">
							Funeral Home Address *
						</label>
						<textarea
							id="funeralHomeAddress"
							bind:value={funeralHomeAddress}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter complete funeral home address"
							rows="3"
							required
							disabled={loading}
						></textarea>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="funeralHomeEmail" class="block text-sm font-medium text-gray-700 mb-1">
								Funeral Home Email *
							</label>
							<input
								id="funeralHomeEmail"
								type="email"
								bind:value={funeralHomeEmail}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter funeral home email"
								required
								disabled={loading}
							/>
						</div>
						
						<div>
							<label for="funeralHomePhone" class="block text-sm font-medium text-gray-700 mb-1">
								Funeral Home Phone *
							</label>
							<input
								id="funeralHomePhone"
								type="tel"
								bind:value={funeralHomePhone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter funeral home phone"
								required
								disabled={loading}
							/>
						</div>
					</div>
				</div>

				<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<div class="flex items-start space-x-3">
						<div class="text-yellow-600">
							<svg class="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
							</svg>
						</div>
						<div>
							<h4 class="font-semibold text-yellow-800">Admin Approval Required</h4>
							<p class="text-sm text-yellow-700 mt-1">
								Your account will be reviewed by our administrators before activation. This process typically takes 1-2 business days.
							</p>
						</div>
					</div>
				</div>
				
				<button type="submit" class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
					{#if loading}
						<span class="flex items-center justify-center">
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Creating Account...
						</span>
					{:else}
						Register as Funeral Director
					{/if}
				</button>
				
				<div class="text-center space-y-2">
					<p class="text-sm text-gray-600">
						Already have an account? <a href="/auth/login" class="text-blue-600 hover:text-blue-800 font-medium">Sign in here</a>
					</p>
					<p class="text-sm text-gray-600">
						Looking for a regular account? <a href="/register" class="text-blue-600 hover:text-blue-800 font-medium">Register as a viewer</a>
					</p>
				</div>
			</form>
		{/if}
	</div>
</div>
