<script lang="ts">
	import { goto } from '$app/navigation';
	
	let email = '';
	let password = '';
	let confirmPassword = '';
	let displayName = '';
	let phone = '';
	let loading = false;
	let error = '';
	let success = false;

	async function handleRegister() {
		error = '';
		
		// Basic validation
		if (!email || !password || !confirmPassword || !displayName) {
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
					phone,
					role: 'Viewer'
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
			phone = '';

			// Redirect to login after 2 seconds
			setTimeout(() => {
				goto('/auth/login');
			}, 2000);

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

<div class="max-w-md mx-auto p-6">
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
		<h2 class="text-2xl font-bold text-center mb-2">Create Viewer Account</h2>
		<p class="text-center text-gray-600 mb-8">Join us to view and share memories</p>
		
		{#if success}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
				<div class="flex items-center">
					<div class="text-green-600 mr-3">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					</div>
					<div>
						<h3 class="font-semibold text-green-800">Success!</h3>
						<p class="text-sm text-green-700">Account created successfully! Redirecting to login...</p>
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
						Email Address *
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Enter your email"
						required
						disabled={loading}
					/>
				</div>

				<div>
					<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
						Phone Number (Optional)
					</label>
					<input
						id="phone"
						type="tel"
						bind:value={phone}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="(555) 123-4567"
						disabled={loading}
					/>
				</div>
				
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
				
				<button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
					{#if loading}
						<span class="flex items-center justify-center">
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Creating Account...
						</span>
					{:else}
						Create Viewer Account
					{/if}
				</button>
				
				<div class="text-center space-y-2">
					<p class="text-sm text-gray-600">
						Already have an account? <a href="/auth/login" class="text-blue-600 hover:text-blue-800 font-medium">Sign in here</a>
					</p>
					<p class="text-sm text-gray-600">
						Are you a funeral director? <a href="/funeral-director-registration" class="text-blue-600 hover:text-blue-800 font-medium">Register here</a>
					</p>
					<p class="text-sm text-gray-600">
						Want to create a memorial? <a href="/create-memorial" class="text-blue-600 hover:text-blue-800 font-medium">Start here</a>
					</p>
				</div>
			</form>
		{/if}
	</div>
</div>
