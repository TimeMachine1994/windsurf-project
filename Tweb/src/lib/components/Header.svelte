<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { signOutUser } from '$lib/firebase/auth';
	import ThemeToggle from './ThemeToggle.svelte';
	
	let showUserMenu = false;
	
	async function handleSignOut() {
		try {
			await signOutUser();
			showUserMenu = false;
		} catch (error) {
			console.error('Sign out error:', error);
		}
	}
	
	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}
</script>

<header class="header">
	<div class="container">
		<div class="logo">
			<a href="/" class="logo-link">
				<h1>Your App</h1>
			</a>
		</div>
		
		<nav class="nav">
			<ul class="nav-list">
				<li><a href="/" class="nav-link">Home</a></li>
				<li><a href="/create-memorial" class="nav-link">Create Memorial</a></li>
				<li><a href="/booking" class="nav-link">Book Services</a></li>
				<li><a href="/about" class="nav-link">About</a></li>
				<li><a href="/contact" class="nav-link">Contact</a></li>
			</ul>
		</nav>
		
		<div class="header-actions">
			<ThemeToggle />
			
			{#if $authStore.loading}
				<div class="loading">Loading...</div>
			{:else if $authStore.user}
				<div class="user-menu">
					<button class="user-button" on:click={toggleUserMenu}>
						<span class="user-info">
							{$authStore.profile?.displayName || $authStore.user.email}
							<span class="user-role">({$authStore.profile?.role || 'Viewer'})</span>
						</span>
						<span class="dropdown-arrow">▼</span>
					</button>
					
					{#if showUserMenu}
						<div class="dropdown-menu">
							<a href="/profile" class="dropdown-item">Profile</a>
							<a href="/schedule" class="dropdown-item">Livestream Schedule</a>
							<button class="dropdown-item" on:click={handleSignOut}>Sign Out</button>
						</div>
					{/if}
				</div>
			{:else}
				<div class="auth-buttons">
					<a href="/login" class="btn btn-secondary">Sign In</a>
					<a href="/register" class="btn btn-primary">Register</a>
				</div>
			{/if}
		</div>
	</div>
</header>

<style>
	.header {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: white;
		padding: 1rem 0;
		box-shadow: var(--shadow-lg);
		position: sticky;
		top: 0;
		z-index: 100;
		transition: all 0.3s ease;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
	}
	
	.logo-link {
		text-decoration: none;
		color: inherit;
	}
	
	.logo h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.025em;
	}
	
	.nav-list {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 2rem;
	}
	
	.nav-link {
		color: white;
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.2s ease;
		position: relative;
	}
	
	.nav-link:hover {
		opacity: 0.8;
	}
	
	.nav-link::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 0;
		height: 2px;
		background: white;
		transition: width 0.3s ease;
	}
	
	.nav-link:hover::after {
		width: 100%;
	}
	
	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		display: inline-block;
	}
	
	.btn-primary {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
	
	.btn-primary:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-1px);
	}
	
	.btn-secondary {
		background: transparent;
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
	
	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
	}
	
	.auth-buttons {
		display: flex;
		gap: 0.5rem;
	}
	
	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.loading {
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.875rem;
	}
	
	.user-menu {
		position: relative;
	}
	
	.user-button {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}
	
	.user-button:hover {
		background: rgba(255, 255, 255, 0.2);
	}
	
	.user-info {
		font-size: 0.875rem;
	}
	
	.user-role {
		opacity: 0.8;
		font-size: 0.75rem;
	}
	
	.dropdown-arrow {
		font-size: 0.75rem;
		transition: transform 0.2s ease;
	}
	
	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		box-shadow: var(--shadow-lg);
		min-width: 150px;
		z-index: 1000;
		margin-top: 0.5rem;
	}
	
	.dropdown-item {
		display: block;
		width: 100%;
		padding: 0.75rem 1rem;
		color: var(--color-text);
		text-decoration: none;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 0.875rem;
		text-align: left;
		transition: background-color 0.2s ease;
	}
	
	.dropdown-item:hover {
		background: var(--color-surface-hover);
	}
	
	.dropdown-item:first-child {
		border-radius: 0.375rem 0.375rem 0 0;
	}
	
	.dropdown-item:last-child {
		border-radius: 0 0 0.375rem 0.375rem;
	}
	
	@media (max-width: 768px) {
		.container {
			flex-direction: column;
			text-align: center;
		}
		
		.nav-list {
			flex-wrap: wrap;
			justify-content: center;
			gap: 1rem;
		}
	}
</style>
