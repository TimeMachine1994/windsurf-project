<script lang="ts">
	import { registerUser } from '$lib/firebase/auth';
	import { authStore } from '$lib/stores/auth';
	
	let email = '';
	let password = '';
	let confirmPassword = '';
	let displayName = '';
	let loading = false;
	let error = '';
	let success = false;

	async function handleRegister() {
		error = '';
		
		// Basic validation
		if (!email || !password || !confirmPassword) {
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
		
		loading = true;
		
		try {
			await registerUser(email, password, displayName);
			success = true;
			// Clear form
			email = '';
			password = '';
			confirmPassword = '';
			displayName = '';
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto p-6">
	<div class="card p-8">
		<h2 class="h2 text-center mb-2">Create Account</h2>
		<p class="text-center text-secondary mb-8">Join us and start your journey as a Viewer</p>
		
		{#if success}
			<aside class="alert variant-filled-success">
				<div class="alert-message">
					<h3 class="h3">Success!</h3>
					<p>Account created successfully! You can now sign in.</p>
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
				
				<div>
					<label for="displayName" class="label">
						<span>Display Name (Optional)</span>
					</label>
					<input
						id="displayName"
						type="text"
						bind:value={displayName}
						class="input"
						placeholder="Enter your display name"
						disabled={loading}
					/>
				</div>
				
				<div>
					<label for="email" class="label">
						<span>Email Address *</span>
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						class="input"
						placeholder="Enter your email"
						required
						disabled={loading}
					/>
				</div>
				
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
				
				<button type="submit" class="btn variant-filled-primary w-full" disabled={loading}>
					{#if loading}
						<span class="animate-pulse">Creating Account...</span>
					{:else}
						Create Account
					{/if}
				</button>
				
				<p class="text-center text-sm">
					Already have an account? <a href="/login" class="anchor">Sign in here</a>
				</p>
				<p class="text-center text-sm">
					Are you a funeral director? <a href="/funeral-director-registration" class="anchor">Register here</a>
				</p>
			</form>
		{/if}
	</div>
</div>

