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

{#if loading}
	<!-- Loading State - Law of Feedback -->
	<section class="bg-surface-50 dark:bg-surface-900 py-24 px-4">
		<div class="max-w-4xl mx-auto text-center">
			<div class="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-6"></div>
			<p class="text-lg text-surface-600 dark:text-surface-400">Loading booking information...</p>
		</div>
	</section>
{:else if error}
	<!-- Error State - Von Restorff Effect -->
	<section class="bg-surface-50 dark:bg-surface-900 py-24 px-4">
		<div class="max-w-2xl mx-auto text-center">
			<div class="bg-white dark:bg-surface-950 p-8 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700">
				<h2 class="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-4">
					Access Required
				</h2>
				<p class="text-lg text-surface-600 dark:text-surface-400 mb-8">{error}</p>
				{#if !$authStore.user}
					<div class="flex flex-col sm:flex-row gap-4 justify-center">
						<a href="/login" 
							class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
							Sign In
						</a>
						<a href="/register" 
							class="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
							Create Account
						</a>
					</div>
				{:else}
					<a href="/" 
						class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block">
						Return Home
					</a>
				{/if}
			</div>
		</div>
	</section>
{:else}
	<!-- Hero Section - Law of Proximity -->
	<section class="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-24 px-4">
		<div class="max-w-4xl mx-auto text-center">
			<div class="space-y-6">
				<h1 class="text-4xl md:text-5xl font-bold leading-tight">
					Book Livestream Services
				</h1>
				{#if memorial}
					<p class="text-xl text-primary-100 leading-relaxed">
						Configure livestream services for <span class="font-semibold">{memorial.lovedOneName}</span>
					</p>
				{:else}
					<p class="text-xl text-primary-100 leading-relaxed">
						Professional livestream services for memorial celebrations
					</p>
				{/if}
			</div>
		</div>
	</section>
	
	<!-- Calculator Section -->
	<section class="py-12 px-4 bg-white dark:bg-surface-950">
		<div class="max-w-7xl mx-auto">
			{#if memorial}
				<Calculator 
					memorialId={memorial.id} 
					data={{ memorial, config }} 
				/>
			{:else}
				<div class="text-center py-12">
					<div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
					<p class="text-surface-600 dark:text-surface-400">Loading memorial data...</p>
				</div>
			{/if}
		</div>
	</section>
{/if}

