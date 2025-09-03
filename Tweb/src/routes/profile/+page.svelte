<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	
	// Redirect if not logged in
	$: if (!$authStore.user && $authStore.initialized) {
		goto('/login');
	}
</script>

<svelte:head>
	<title>Profile - Your App</title>
	<meta name="description" content="User profile page" />
</svelte:head>

{#if $authStore.user && $authStore.profile}
	<div class="profile-page">
		<div class="container">
			<div class="profile-card">
				<h1>User Profile</h1>
				
				<div class="profile-info">
					<div class="info-group">
						<label>Email</label>
						<p>{$authStore.user.email}</p>
					</div>
					
					<div class="info-group">
						<label>Display Name</label>
						<p>{$authStore.profile.displayName || 'Not set'}</p>
					</div>
					
					<div class="info-group">
						<label>Role</label>
						<p class="role-badge role-{$authStore.profile.role.toLowerCase()}">
							{$authStore.profile.role}
						</p>
					</div>
					
					<div class="info-group">
						<label>Member Since</label>
						<p>{$authStore.profile.createdAt.toLocaleDateString()}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else if $authStore.loading}
	<div class="loading-container">
		<p>Loading profile...</p>
	</div>
{/if}

<style>
	.profile-page {
		padding: 2rem 1rem;
		min-height: 80vh;
	}
	
	.container {
		max-width: 600px;
		margin: 0 auto;
	}
	
	.profile-card {
		background: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
	}
	
	h1 {
		margin: 0 0 2rem 0;
		color: #1f2937;
		text-align: center;
	}
	
	.profile-info {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.info-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	label {
		font-weight: 600;
		color: #374151;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	p {
		margin: 0;
		color: #1f2937;
		font-size: 1rem;
	}
	
	.role-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}
	
	.role-viewer {
		background: #dbeafe;
		color: #1e40af;
	}
	
	.role-owner {
		background: #dcfce7;
		color: #166534;
	}
	
	.role-admin {
		background: #fef3c7;
		color: #92400e;
	}
	
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 80vh;
		color: #6b7280;
	}
</style>
