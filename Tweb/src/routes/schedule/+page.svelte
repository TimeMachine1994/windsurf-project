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

	onMount(async () => {
		if ($authStore.user && $authStore.profile?.role === 'Owner') {
			try {
				console.log('📅 Loading schedule for user:', $authStore.user.uid);
				memorial = await getMemorialByCreatorUid($authStore.user.uid);
				console.log('✅ Memorial loaded for schedule:', memorial);
				
				if (memorial) {
					// Load livestream configuration
					livestreamConfig = await getLivestreamConfig(memorial.customUrl);
					console.log('📊 Livestream config loaded:', livestreamConfig);
				}
			} catch (err: any) {
				console.error('❌ Error loading memorial for schedule:', err);
				error = 'Failed to load memorial data';
			}
		} else {
			error = 'Access denied. Only memorial owners can view schedules.';
		}
		loading = false;
	});

	function handleEditSchedule() {
		console.log('📝 Edit schedule clicked');
		window.location.href = '/booking';
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
		{:else if error}
			<div class="error-container">
				<h2>Access Error</h2>
				<p>{error}</p>
				<a href="/" class="btn btn-primary">Return Home</a>
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
								{memorial.createdAt?.toDate ? memorial.createdAt.toDate().toLocaleDateString() : new Date(memorial.createdAt).toLocaleDateString()}
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

<style>
	.schedule-container {
		min-height: calc(100vh - 80px);
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 2rem 0;
	}

	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.loading-container, .error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		text-align: center;
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

	.schedule-content {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.schedule-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 3rem 2rem;
		text-align: center;
	}

	.schedule-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.subtitle {
		margin: 0;
		opacity: 0.9;
		font-size: 1.125rem;
	}

	.memorial-overview {
		padding: 2rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.memorial-overview h2 {
		margin: 0 0 1.5rem 0;
		color: #374151;
		font-size: 1.5rem;
	}

	.memorial-card {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.memorial-details h3 {
		margin: 0 0 1rem 0;
		color: #111827;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.memorial-details p {
		margin: 0.5rem 0;
		color: #6b7280;
		line-height: 1.5;
	}

	.url-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
	}

	.url-link:hover {
		text-decoration: underline;
	}

	.schedule-section {
		padding: 2rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.section-header h2 {
		margin: 0;
		color: #374151;
		font-size: 1.5rem;
	}

	.schedule-placeholder {
		background: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 1rem;
		padding: 3rem 2rem;
		text-align: center;
	}

	.placeholder-content {
		max-width: 400px;
		margin: 0 auto;
	}

	.calendar-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.placeholder-content h3 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1.25rem;
	}

	.placeholder-content p {
		margin: 0 0 2rem 0;
		color: #6b7280;
		line-height: 1.6;
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

	.schedule-details {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.service-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.service-card h3 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1.125rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.service-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-row strong {
		color: #374151;
		font-weight: 500;
		min-width: 120px;
		flex-shrink: 0;
	}

	.info-row .value {
		color: #6b7280;
		text-align: right;
		flex: 1;
	}

	.addon-item {
		padding: 0.5rem 0;
		color: #059669;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.payment-status-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-top: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.payment-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.status-row, .amount-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.status-label, .amount-label {
		font-weight: 500;
		color: #374151;
	}

	.status-badge {
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-badge.not-paid {
		background: #fef2f2;
		color: #dc2626;
		border: 1px solid #fecaca;
	}

	.status-badge.paid {
		background: #f0fdf4;
		color: #059669;
		border: 1px solid #bbf7d0;
	}

	.amount-value {
		font-size: 1.125rem;
		font-weight: 600;
		color: #374151;
	}

	@media (max-width: 768px) {
		.schedule-header {
			padding: 2rem 1rem;
		}

		.schedule-header h1 {
			font-size: 2rem;
		}

		.memorial-overview, .schedule-section {
			padding: 1.5rem;
		}

		.section-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.schedule-placeholder {
			padding: 2rem 1rem;
		}
	}
</style>
