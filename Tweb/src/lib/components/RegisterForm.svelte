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

<div class="register-form">
	<div class="form-container">
		<h2>Create Account</h2>
		<p class="subtitle">Join us and start your journey as a Viewer</p>
		
		{#if success}
			<div class="success-message">
				<p>✅ Account created successfully! You can now sign in.</p>
			</div>
		{:else}
			<form on:submit|preventDefault={handleRegister}>
				{#if error}
					<div class="error-message">
						<p>{error}</p>
					</div>
				{/if}
				
				<div class="form-group">
					<label for="displayName">Display Name (Optional)</label>
					<input
						id="displayName"
						type="text"
						bind:value={displayName}
						placeholder="Enter your display name"
						disabled={loading}
					/>
				</div>
				
				<div class="form-group">
					<label for="email">Email Address *</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="Enter your email"
						required
						disabled={loading}
					/>
				</div>
				
				<div class="form-group">
					<label for="password">Password *</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="Enter your password"
						required
						disabled={loading}
					/>
				</div>
				
				<div class="form-group">
					<label for="confirmPassword">Confirm Password *</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						placeholder="Confirm your password"
						required
						disabled={loading}
					/>
				</div>
				
				<button type="submit" class="btn btn-primary" disabled={loading}>
					{#if loading}
						Creating Account...
					{:else}
						Create Account
					{/if}
				</button>
				
				<p class="form-footer">
					Already have an account? <a href="/login">Sign in here</a>
				</p>
			</form>
		{/if}
	</div>
</div>

<style>
	.register-form {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 80vh;
		padding: 2rem 1rem;
	}
	
	.form-container {
		background: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
	}
	
	h2 {
		text-align: center;
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.5rem;
		font-weight: 700;
	}
	
	.subtitle {
		text-align: center;
		color: #6b7280;
		margin: 0 0 2rem 0;
		font-size: 0.875rem;
	}
	
	.form-group {
		margin-bottom: 1rem;
	}
	
	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #374151;
		font-weight: 500;
		font-size: 0.875rem;
	}
	
	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 1rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
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
	
	.btn {
		width: 100%;
		padding: 0.75rem;
		border: none;
		border-radius: 0.375rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: 0.5rem;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}
	
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	
	.error-message {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
	}
	
	.error-message p {
		margin: 0;
		font-size: 0.875rem;
	}
	
	.success-message {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		color: #166534;
		padding: 0.75rem;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
		text-align: center;
	}
	
	.success-message p {
		margin: 0;
		font-size: 0.875rem;
	}
	
	.form-footer {
		text-align: center;
		margin-top: 1.5rem;
		color: #6b7280;
		font-size: 0.875rem;
	}
	
	.form-footer a {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
	}
	
	.form-footer a:hover {
		text-decoration: underline;
	}
</style>
