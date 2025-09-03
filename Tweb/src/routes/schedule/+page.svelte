<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { getMemorialByCreatorUid } from '$lib/firebase/memorial';
	import type { Memorial } from '$lib/types/memorial';

	let memorial: Memorial | null = null;
	let loading = true;
	let error = '';

	onMount(async () => {
		if ($authStore.user && $authStore.profile?.role === 'Owner') {
			try {
				console.log('📅 Loading schedule for user:', $authStore.user.uid);
				memorial = await getMemorialByCreatorUid($authStore.user.uid);
				console.log('✅ Memorial loaded for schedule:', memorial);
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
		// TODO: Navigate to edit schedule page
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
							Edit Schedule
						</button>
					</div>
					
					<div class="schedule-placeholder">
						<div class="placeholder-content">
							<div class="calendar-icon">📅</div>
							<h3>No Schedule Set</h3>
							<p>You haven't scheduled any livestream events yet. Click "Edit Schedule" to add streaming times for your memorial service.</p>
							<button class="btn btn-secondary" on:click={handleEditSchedule}>
								Set Up Schedule
							</button>
						</div>
					</div>
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
