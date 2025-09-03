<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { getMemorialByCreatorUid } from '$lib/firebase/memorial';
	import { getLivestreamConfig } from '$lib/firebase/livestream';
	import Calculator from './Calculator.svelte';
	import type { Memorial } from '$lib/types/memorial';
	import type { LivestreamConfig } from '$lib/types/livestream';

	let memorial: Memorial | null = null;
	let config: LivestreamConfig | null = null;
	let loading = true;
	let error = '';

	async function loadBookingData() {
		console.log('📅 Loading booking data...');
		console.log('🔍 Auth state:', { 
			user: !!$authStore.user, 
			profile: !!$authStore.profile, 
			role: $authStore.profile?.role,
			initialized: $authStore.initialized 
		});
		
		if ($authStore.user && $authStore.profile?.role === 'Owner') {
			try {
				console.log('🔍 Loading memorial for booking:', $authStore.user.uid);
				memorial = await getMemorialByCreatorUid($authStore.user.uid);
				console.log('✅ Memorial loaded for booking:', memorial);
				
				// If no memorial found, show helpful message
				if (!memorial) {
					error = 'No memorial found for your account. Please create a memorial first before booking livestream services.';
					loading = false;
					return;
				}
				
				// Load existing livestream config if available
				if (memorial?.id) {
					console.log('🔍 Loading livestream config for memorial:', memorial.id);
					config = await getLivestreamConfig(memorial.id);
					console.log('✅ Livestream config loaded:', config);
				}
			} catch (err: any) {
				console.error('❌ Error loading memorial for booking:', err);
				error = 'Failed to load memorial data. Please try refreshing the page.';
			}
		} else if (!$authStore.user) {
			error = 'Please sign in to book livestream services.';
		} else {
			error = 'Access denied. Only memorial owners can book services.';
		}
		loading = false;
	}

	onMount(() => {
		// Wait for auth store to be initialized before checking access
		const unsubscribe = authStore.subscribe((state) => {
			if (state.initialized && loading) {
				loadBookingData();
			}
		});

		return unsubscribe;
	});
</script>

<svelte:head>
	<title>Book Livestream Services - TributeStream</title>
</svelte:head>

<div class="booking-container">
	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading booking information...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<div class="error-content">
				<h2>Access Required</h2>
				<p>{error}</p>
				{#if !$authStore.user}
					<div class="auth-actions">
						<a href="/login" class="btn btn-primary">Sign In</a>
						<a href="/register" class="btn btn-secondary">Create Account</a>
					</div>
				{:else}
					<a href="/" class="btn btn-primary">Return Home</a>
				{/if}
			</div>
		</div>
	{:else}
		<div class="booking-header">
			<div class="container">
				<h1>Book Livestream Services</h1>
				{#if memorial}
					<p class="subtitle">Configure livestream services for {memorial.lovedOneName}</p>
				{:else}
					<p class="subtitle">Professional livestream services for memorial celebrations</p>
				{/if}
			</div>
		</div>
		
		<div class="calculator-wrapper">
			<div class="container">
				{#if memorial}
					<Calculator 
						memorialId={memorial.id} 
						data={{ memorial, config }} 
					/>
				{:else}
					<div class="loading-container">
						<div class="spinner"></div>
						<p>Loading memorial data...</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.booking-container {
		min-height: calc(100vh - 80px);
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.loading-container, .error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 2rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e5e7eb;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error-content {
		text-align: center;
		max-width: 400px;
	}

	.error-content h2 {
		color: #374151;
		margin-bottom: 1rem;
	}

	.error-content p {
		color: #6b7280;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.auth-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.booking-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 3rem 0;
		text-align: center;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.booking-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.subtitle {
		margin: 0;
		opacity: 0.9;
		font-size: 1.125rem;
	}

	.calculator-wrapper {
		padding: 2rem 0;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		display: inline-block;
		font-size: 0.875rem;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}

	.btn-secondary:hover {
		background: #667eea;
		color: white;
		transform: translateY(-2px);
	}

	@media (max-width: 768px) {
		.booking-header {
			padding: 2rem 0;
		}

		.booking-header h1 {
			font-size: 2rem;
		}

		.auth-actions {
			flex-direction: column;
			align-items: center;
		}

		.btn {
			width: 200px;
		}
	}
</style>
