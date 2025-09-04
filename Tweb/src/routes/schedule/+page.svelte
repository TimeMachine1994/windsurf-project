<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { getMemorialByCreatorUid } from '$lib/firebase/memorial';
	import { getLivestreamConfig } from '$lib/firebase/livestream';
	import type { Memorial } from '$lib/types/memorial';
	import type { LivestreamConfig } from '$lib/types/livestream';

	let memorial: Memorial | null = null;
	let livestreamConfig: LivestreamConfig | null = null;
	let loading = true;
	let error = '';
	let showCreateMemorialPrompt = false;
	let creatingMemorial = false;
	let lovedOneName = '';

	onMount(async () => {
		if ($authStore.user && $authStore.profile?.role === 'Owner') {
			try {
				console.log('📅 Loading schedule for user:', $authStore.user.uid);
				memorial = await getMemorialByCreatorUid($authStore.user.uid);
				console.log('✅ Memorial loaded for schedule:', memorial);
				
				if (memorial) {
					// Load livestream configuration
					if (memorial.customUrl) {
						livestreamConfig = await getLivestreamConfig(memorial.customUrl);
					}
					console.log('📊 Livestream config loaded:', livestreamConfig);
				}
			} catch (err: any) {
				console.error('❌ Error loading memorial for schedule:', err);
				error = 'Failed to load memorial data';
			}
		} else {
			// For viewers, show memorial creation option instead of access error
			showCreateMemorialPrompt = true;
		}
		loading = false;
	});

	function handleEditSchedule() {
		console.log('📝 Edit schedule clicked');
		window.location.href = '/booking';
	}

	async function handleCreateMemorial() {
		if (!lovedOneName.trim()) {
			error = 'Please enter a loved one\'s name';
			return;
		}

		creatingMemorial = true;
		error = '';

		try {
			// Redirect to create memorial page with the name pre-filled
			await goto(`/create-memorial?name=${encodeURIComponent(lovedOneName.trim())}`);
		} catch (err: any) {
			error = 'Failed to create memorial. Please try again.';
			creatingMemorial = false;
		}
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return 'Not specified';
		try {
			return new Date(dateStr).toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateStr;
		}
	}

	function formatTime(timeStr: string | null): string {
		if (!timeStr) return 'Not specified';
		try {
			const [hours, minutes] = timeStr.split(':');
			const date = new Date();
			date.setHours(parseInt(hours), parseInt(minutes));
			return date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			});
		} catch {
			return timeStr;
		}
	}
</script>

<svelte:head>
	<title>Livestream Schedule - TributeStream</title>
</svelte:head>

<div class="schedule-container">
	<div class="container">
		{#if loading}
			<div class="loading-container">
				<div class="spinner"></div>
				<p>Loading your schedule...</p>
			</div>
		{:else if showCreateMemorialPrompt}
			<!-- Memorial Creation Prompt for Viewers - Law of Proximity & Von Restorff Effect -->
			<div class="max-w-2xl mx-auto p-6">
				<div class="card p-8 text-center">
					<div class="mb-6">
						<div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
							</svg>
						</div>
						<h1 class="h1 mb-4">Create Your First Memorial</h1>
						<p class="text-lg text-secondary mb-8">
							To access livestream scheduling, you'll need to create a memorial first.
							This will upgrade your account to Owner status.
						</p>
					</div>

					{#if error}
						<aside class="alert variant-filled-error mb-6">
							<div class="alert-message">
								<h3 class="h3">Error</h3>
								<p>{error}</p>
							</div>
						</aside>
					{/if}

					<!-- Miller's Rule - Simple form with minimal fields -->
					<form on:submit|preventDefault={handleCreateMemorial} class="space-y-6">
						<div>
							<label for="lovedOneName" class="label">
								<span class="text-lg font-medium">Loved One's Name</span>
							</label>
							<input
								id="lovedOneName"
								type="text"
								bind:value={lovedOneName}
								class="input text-lg"
								placeholder="Enter their full name"
								required
								disabled={creatingMemorial}
							/>
						</div>

						<!-- Fitts's Law - Large, prominent action buttons -->
						<div class="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								type="submit"
								disabled={creatingMemorial}
								class="btn variant-filled-primary text-lg px-8 py-3"
							>
								{#if creatingMemorial}
									<span class="animate-pulse">Creating Memorial...</span>
								{:else}
									Create Memorial & Continue
								{/if}
							</button>
							<a href="/" class="btn variant-ghost-surface text-lg px-8 py-3">
								Maybe Later
							</a>
						</div>
					</form>

					<!-- Law of Common Region - Benefits section -->
					<div class="mt-12 pt-8 border-t border-surface-300">
						<h3 class="h3 mb-6">What You'll Get as a Memorial Owner</h3>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
							<div class="flex items-start space-x-3">
								<div class="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
									<svg class="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
									</svg>
								</div>
								<div>
									<h4 class="font-semibold mb-1">Livestream Scheduling</h4>
									<p class="text-sm text-secondary">Schedule and manage memorial service livestreams</p>
								</div>
							</div>
							<div class="flex items-start space-x-3">
								<div class="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
									<svg class="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
									</svg>
								</div>
								<div>
									<h4 class="font-semibold mb-1">Custom Memorial Page</h4>
									<p class="text-sm text-secondary">Beautiful, personalized memorial website</p>
								</div>
							</div>
							<div class="flex items-start space-x-3">
								<div class="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
									<svg class="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
									</svg>
								</div>
								<div>
									<h4 class="font-semibold mb-1">Full Control</h4>
									<p class="text-sm text-secondary">Manage all aspects of the memorial</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else if error}
			<div class="max-w-md mx-auto p-6">
				<aside class="alert variant-filled-error">
					<div class="alert-message">
						<h3 class="h3">Error</h3>
						<p>{error}</p>
					</div>
				</aside>
				<div class="text-center mt-6">
					<a href="/" class="btn variant-filled-primary">Return Home</a>
				</div>
			</div>
		{:else if memorial}
			<div class="schedule-content">
				<div class="schedule-header">
					<h1>Livestream Schedule</h1>
					<p class="subtitle">Manage your memorial service streaming schedule</p>
				</div>

				<div class="memorial-overview">
					<h2>Memorial Overview</h2>
					<div class="memorial-card">
						<div class="memorial-details">
							<h3>{memorial.lovedOneName}</h3>
							<p class="memorial-url">
								<strong>Memorial URL:</strong> 
								<a href="/{memorial.customUrl}" target="_blank" class="url-link">
									tributestream.com/{memorial.customUrl}
								</a>
							</p>
							<p class="created-date">
								<strong>Created:</strong> 
								{typeof memorial.createdAt === 'object' && 'toDate' in memorial.createdAt ? memorial.createdAt.toDate().toLocaleDateString() : new Date(memorial.createdAt).toLocaleDateString()}
							</p>
							<p class="creator-info">
								<strong>Creator:</strong> {memorial.creatorName} ({memorial.creatorEmail})
							</p>
						</div>
					</div>
				</div>

				<div class="schedule-section">
					<div class="section-header">
						<h2>Streaming Schedule</h2>
						<button class="btn btn-primary" on:click={handleEditSchedule}>
							{livestreamConfig ? 'Edit Schedule' : 'Set Up Schedule'}
						</button>
					</div>
					
					{#if livestreamConfig && livestreamConfig.formData}
						<div class="schedule-details">
							<div class="service-card">
								<h3>📹 Main Service</h3>
								<div class="service-info">
									<div class="info-row">
										<strong>Date:</strong> 
										<span class="value">
											{livestreamConfig.formData.mainService.time.isUnknown 
												? 'Date to be determined' 
												: formatDate(livestreamConfig.formData.mainService.time.date)}
										</span>
									</div>
									<div class="info-row">
										<strong>Time:</strong> 
										<span class="value">
											{livestreamConfig.formData.mainService.time.isUnknown 
												? 'Time to be determined' 
												: formatTime(livestreamConfig.formData.mainService.time.time)}
										</span>
									</div>
									<div class="info-row">
										<strong>Duration:</strong> 
										<span class="value">{livestreamConfig.formData.mainService.hours} hours</span>
									</div>
									<div class="info-row">
										<strong>Location:</strong> 
										<span class="value">
											{livestreamConfig.formData.mainService.location.isUnknown 
												? 'Location to be determined' 
												: `${livestreamConfig.formData.mainService.location.name}, ${livestreamConfig.formData.mainService.location.address}`}
										</span>
									</div>
								</div>
							</div>

							{#if livestreamConfig.formData.additionalLocation.enabled}
								<div class="service-card">
									<h3>📍 Additional Location</h3>
									<div class="service-info">
										<div class="info-row">
											<strong>Duration:</strong> 
											<span class="value">{livestreamConfig.formData.additionalLocation.hours} hours</span>
										</div>
										<div class="info-row">
											<strong>Location:</strong> 
											<span class="value">
												{livestreamConfig.formData.additionalLocation.location.isUnknown 
													? 'Location to be determined' 
													: `${livestreamConfig.formData.additionalLocation.location.name}, ${livestreamConfig.formData.additionalLocation.location.address}`}
											</span>
										</div>
									</div>
								</div>
							{/if}

							{#if livestreamConfig.formData.additionalDay.enabled}
								<div class="service-card">
									<h3>📅 Additional Day</h3>
									<div class="service-info">
										<div class="info-row">
											<strong>Start Time:</strong> 
											<span class="value">
												{livestreamConfig.formData.additionalDay.startTime 
													? formatTime(livestreamConfig.formData.additionalDay.startTime)
													: 'Time to be determined'}
											</span>
										</div>
										<div class="info-row">
											<strong>Duration:</strong> 
											<span class="value">{livestreamConfig.formData.additionalDay.hours} hours</span>
										</div>
										<div class="info-row">
											<strong>Location:</strong> 
											<span class="value">
												{livestreamConfig.formData.additionalDay.location.isUnknown 
													? 'Location to be determined' 
													: `${livestreamConfig.formData.additionalDay.location.name}, ${livestreamConfig.formData.additionalDay.location.address}`}
											</span>
										</div>
									</div>
								</div>
							{/if}

							{#if livestreamConfig.formData.funeralDirectorName || livestreamConfig.formData.funeralHome}
								<div class="service-card">
									<h3>🏢 Service Details</h3>
									<div class="service-info">
										{#if livestreamConfig.formData.funeralDirectorName}
											<div class="info-row">
												<strong>Funeral Director:</strong> 
												<span class="value">{livestreamConfig.formData.funeralDirectorName}</span>
											</div>
										{/if}
										{#if livestreamConfig.formData.funeralHome}
											<div class="info-row">
												<strong>Funeral Home:</strong> 
												<span class="value">{livestreamConfig.formData.funeralHome}</span>
											</div>
										{/if}
									</div>
								</div>
							{/if}

							{#if livestreamConfig.formData.addons && (livestreamConfig.formData.addons.photography || livestreamConfig.formData.addons.audioVisualSupport || livestreamConfig.formData.addons.liveMusician || livestreamConfig.formData.addons.woodenUsbDrives > 0)}
								<div class="service-card">
									<h3>✨ Additional Services</h3>
									<div class="service-info">
										{#if livestreamConfig.formData.addons.photography}
											<div class="addon-item">📸 Professional Photography</div>
										{/if}
										{#if livestreamConfig.formData.addons.audioVisualSupport}
											<div class="addon-item">🎵 Audio/Visual Support</div>
										{/if}
										{#if livestreamConfig.formData.addons.liveMusician}
											<div class="addon-item">🎼 Live Musician</div>
										{/if}
										{#if livestreamConfig.formData.addons.woodenUsbDrives > 0}
											<div class="addon-item">💾 {livestreamConfig.formData.addons.woodenUsbDrives} Wooden USB Drive(s)</div>
										{/if}
									</div>
								</div>
							{/if}

							<div class="payment-status-card">
								<div class="payment-info">
									<div class="status-row">
										<span class="status-label">Payment Status:</span>
										<span class="status-badge not-paid">Not Paid</span>
									</div>
									{#if livestreamConfig.total}
										<div class="amount-row">
											<span class="amount-label">Total Amount:</span>
											<span class="amount-value">${livestreamConfig.total.toLocaleString()}</span>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{:else}
						<div class="schedule-placeholder">
							<div class="placeholder-content">
								<div class="calendar-icon">📅</div>
								<h3>No Schedule Set</h3>
								<p>You haven't scheduled any livestream events yet. Click "Set Up Schedule" to add streaming times for your memorial service.</p>
								<button class="btn btn-secondary" on:click={handleEditSchedule}>
									Set Up Schedule
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

