<script lang="ts">
	import { registerFuneralDirector } from '$lib/firebase/auth';
	import { authStore } from '$lib/stores/auth';
	
	let email = '';
	let password = '';
	let confirmPassword = '';
	let displayName = '';
	let funeralHomeName = '';
	let funeralHomeAddress = '';
	let funeralHomeEmail = '';
	let funeralHomePhone = '';
	let personalPhone = '';
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
			await registerFuneralDirector(
				email, 
				password, 
				displayName,
				funeralHomeName,
				funeralHomeAddress,
				funeralHomeEmail,
				funeralHomePhone,
				personalPhone
			);
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
			// Handle specific Firebase errors
			if (err.message.includes('email-already-in-use')) {
				error = 'An account with this email already exists. Please use a different email or try signing in.';
			} else if (err.message.includes('weak-password')) {
				error = 'Password is too weak. Please choose a stronger password.';
			} else if (err.message.includes('invalid-email')) {
				error = 'Please enter a valid email address.';
			} else if (err.message.includes('network-request-failed')) {
				error = 'Network error. Please check your internet connection and try again.';
			} else {
				error = err.message || 'Registration failed. Please try again.';
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto p-6">
	<div class="card p-8">
		<h2 class="h2 text-center mb-2">Funeral Director Registration</h2>
		<p class="text-center text-secondary mb-8">
			Register to join our network of professional funeral directors. Your account will require admin approval before activation.
		</p>
		
		{#if success}
			<aside class="alert variant-filled-success">
				<div class="alert-message">
					<h3 class="h3">Registration Submitted!</h3>
					<p>Your funeral director account has been created and is pending admin approval. You will receive an email notification once your account is approved and ready to use.</p>
					<div class="mt-4">
						<a href="/login" class="btn variant-filled-primary">Sign In</a>
					</div>
				</div>
			</aside>
		{:else}
			<form on:submit|preventDefault={handleRegister} class="space-y-6">
				{#if error}
					<aside class="alert variant-filled-error">
						<div class="alert-message">
							<h3 class="h3">Error</h3>
							<p>{error}</p>
						</div>
					</aside>
				{/if}
				
				<!-- Personal Information Section -->
				<div class="space-y-4">
					<h3 class="h3 text-primary-500">Personal Information</h3>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="displayName" class="label">
								<span>Full Name *</span>
							</label>
							<input
								id="displayName"
								type="text"
								bind:value={displayName}
								class="input"
								placeholder="Enter your full name"
								required
								disabled={loading}
							/>
						</div>
						
						<div>
							<label for="email" class="label">
								<span>Personal Email *</span>
							</label>
							<input
								id="email"
								type="email"
								bind:value={email}
								class="input"
								placeholder="Enter your personal email"
								required
								disabled={loading}
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="personalPhone" class="label">
								<span>Personal Phone *</span>
							</label>
							<input
								id="personalPhone"
								type="tel"
								bind:value={personalPhone}
								class="input"
								placeholder="Enter your personal phone"
								required
								disabled={loading}
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="password" class="label">
								<span>Password *</span>
							</label>
							<input
								id="password"
								type="password"
								bind:value={password}
								class="input"
								placeholder="Enter your password"
								required
								disabled={loading}
							/>
						</div>
						
						<div>
							<label for="confirmPassword" class="label">
								<span>Confirm Password *</span>
							</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								class="input"
								placeholder="Confirm your password"
								required
								disabled={loading}
							/>
						</div>
					</div>
				</div>

				<!-- Funeral Home Information Section -->
				<div class="space-y-4">
					<h3 class="h3 text-primary-500">Funeral Home Information</h3>
					
					<div>
						<label for="funeralHomeName" class="label">
							<span>Funeral Home Name *</span>
						</label>
						<input
							id="funeralHomeName"
							type="text"
							bind:value={funeralHomeName}
							class="input"
							placeholder="Enter funeral home name"
							required
							disabled={loading}
						/>
					</div>

					<div>
						<label for="funeralHomeAddress" class="label">
							<span>Funeral Home Address *</span>
						</label>
						<textarea
							id="funeralHomeAddress"
							bind:value={funeralHomeAddress}
							class="textarea"
							placeholder="Enter complete funeral home address"
							rows="3"
							required
							disabled={loading}
						></textarea>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="funeralHomeEmail" class="label">
								<span>Funeral Home Email *</span>
							</label>
							<input
								id="funeralHomeEmail"
								type="email"
								bind:value={funeralHomeEmail}
								class="input"
								placeholder="Enter funeral home email"
								required
								disabled={loading}
							/>
						</div>
						
						<div>
							<label for="funeralHomePhone" class="label">
								<span>Funeral Home Phone *</span>
							</label>
							<input
								id="funeralHomePhone"
								type="tel"
								bind:value={funeralHomePhone}
								class="input"
								placeholder="Enter funeral home phone"
								required
								disabled={loading}
							/>
						</div>
					</div>
				</div>

				<div class="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
					<div class="flex items-start space-x-3">
						<div class="text-warning-600 dark:text-warning-400">
							<svg class="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
							</svg>
						</div>
						<div>
							<h4 class="font-semibold text-warning-800 dark:text-warning-200">Admin Approval Required</h4>
							<p class="text-sm text-warning-700 dark:text-warning-300 mt-1">
								Your account will be reviewed by our administrators before activation. This process typically takes 1-2 business days.
							</p>
						</div>
					</div>
				</div>
				
				<button type="submit" class="btn variant-filled-primary w-full" disabled={loading}>
					{#if loading}
						<span class="animate-pulse">Creating Account...</span>
					{:else}
						Register as Funeral Director
					{/if}
				</button>
				
				<p class="text-center text-sm">
					Already have an account? <a href="/login" class="anchor">Sign in here</a>
				</p>
				<p class="text-center text-sm">
					Looking for a regular account? <a href="/register" class="anchor">Register as a viewer</a>
				</p>
			</form>
		{/if}
	</div>
</div>
