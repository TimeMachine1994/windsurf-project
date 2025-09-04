<script lang="ts">
	import { signInUser } from '$lib/firebase/auth';
	import { authStore } from '$lib/stores/auth';
	
	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleLogin() {
		error = '';
		
		// Basic validation
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}
		
		loading = true;
		
		try {
			await signInUser(email, password);
			// Clear form on success
			email = '';
			password = '';
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto p-6">
	<div class="card p-8">
		<h2 class="h2 text-center mb-2">Sign In</h2>
		<p class="text-center text-secondary mb-8">Welcome back! Please sign in to your account</p>
		
		<form on:submit|preventDefault={handleLogin} class="space-y-6">
			{#if error}
				<aside class="alert variant-filled-error">
					<div class="alert-message">
						<h3 class="h3">Error</h3>
						<p>{error}</p>
					</div>
				</aside>
			{/if}
			
			<div>
				<label for="email" class="label">
					<span>Email Address</span>
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
					<span>Password</span>
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
			
			<button type="submit" class="btn variant-filled-primary w-full" disabled={loading}>
				{#if loading}
					<span class="animate-pulse">Signing In...</span>
				{:else}
					Sign In
				{/if}
			</button>
			
			<p class="text-center text-sm">
				Don't have an account? <a href="/register" class="anchor">Create one here</a>
			</p>
		</form>
	</div>
</div>

