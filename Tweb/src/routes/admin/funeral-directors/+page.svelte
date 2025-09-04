<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { getPendingFuneralDirectors, approveFuneralDirector, rejectFuneralDirector } from '$lib/firebase/auth';
	import type { UserProfile } from '$lib/firebase/auth';
	import { goto } from '$app/navigation';
	
	let pendingDirectors: UserProfile[] = [];
	let loading = true;
	let error = '';
	let processingUid = '';

	// Check if user is admin
	$: if ($authStore.initialized && (!$authStore.user || !$authStore.profile || $authStore.profile.role !== 'Admin')) {
		goto('/');
	}

	onMount(async () => {
		if ($authStore.profile?.role === 'Admin') {
			await loadPendingDirectors();
		}
	});

	async function loadPendingDirectors() {
		try {
			loading = true;
			error = '';
			pendingDirectors = await getPendingFuneralDirectors();
		} catch (err: any) {
			error = err.message || 'Failed to load pending funeral directors';
			console.error('Error loading pending directors:', err);
		} finally {
			loading = false;
		}
	}

	async function handleApprove(uid: string) {
		if (!$authStore.user) return;
		
		try {
			processingUid = uid;
			await approveFuneralDirector(uid, $authStore.user.uid);
			// Remove from pending list
			pendingDirectors = pendingDirectors.filter(director => director.uid !== uid);
		} catch (err: any) {
			error = err.message || 'Failed to approve funeral director';
			console.error('Error approving director:', err);
		} finally {
			processingUid = '';
		}
	}

	async function handleReject(uid: string) {
		if (!$authStore.user) return;
		
		try {
			processingUid = uid;
			await rejectFuneralDirector(uid, $authStore.user.uid);
			// Remove from pending list
			pendingDirectors = pendingDirectors.filter(director => director.uid !== uid);
		} catch (err: any) {
			error = err.message || 'Failed to reject funeral director';
			console.error('Error rejecting director:', err);
		} finally {
			processingUid = '';
		}
	}

	function formatDate(date: Date | { toDate(): Date }): string {
		const d = date instanceof Date ? date : date.toDate();
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
	}
</script>

<svelte:head>
	<title>Funeral Director Approvals - Admin - TributeStream</title>
	<meta name="description" content="Admin interface for approving funeral director registrations" />
</svelte:head>

{#if $authStore.profile?.role === 'Admin'}
	<div class="container mx-auto px-4 py-8">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="h1">Funeral Director Approvals</h1>
				<p class="text-secondary">Review and approve pending funeral director registrations</p>
			</div>
			<button 
				class="btn variant-filled-secondary" 
				on:click={loadPendingDirectors}
				disabled={loading}
			>
				{#if loading}
					<span class="animate-pulse">Refreshing...</span>
				{:else}
					Refresh
				{/if}
			</button>
		</div>

		{#if error}
			<aside class="alert variant-filled-error mb-6">
				<div class="alert-message">
					<h3 class="h3">Error</h3>
					<p>{error}</p>
				</div>
			</aside>
		{/if}

		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
					<p class="text-secondary">Loading pending approvals...</p>
				</div>
			</div>
		{:else if pendingDirectors.length === 0}
			<div class="card p-8 text-center">
				<div class="text-6xl mb-4">✅</div>
				<h2 class="h2 mb-2">All Caught Up!</h2>
				<p class="text-secondary">No pending funeral director approvals at this time.</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each pendingDirectors as director (director.uid)}
					<div class="card p-6">
						<div class="flex items-start justify-between mb-4">
							<div>
								<h3 class="h3 text-primary-500">{director.displayName}</h3>
								<p class="text-secondary text-sm">Registered: {formatDate(director.createdAt)}</p>
							</div>
							<div class="flex space-x-2">
								<button 
									class="btn variant-filled-success"
									on:click={() => handleApprove(director.uid)}
									disabled={processingUid === director.uid}
								>
									{#if processingUid === director.uid}
										<span class="animate-pulse">Approving...</span>
									{:else}
										Approve
									{/if}
								</button>
								<button 
									class="btn variant-filled-error"
									on:click={() => handleReject(director.uid)}
									disabled={processingUid === director.uid}
								>
									{#if processingUid === director.uid}
										<span class="animate-pulse">Rejecting...</span>
									{:else}
										Reject
									{/if}
								</button>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- Personal Information -->
							<div class="space-y-3">
								<h4 class="h4 text-surface-600 dark:text-surface-300">Personal Information</h4>
								<div class="space-y-2 text-sm">
									<div>
										<span class="font-semibold">Email:</span>
										<span class="ml-2">{director.email}</span>
									</div>
									{#if director.personalPhone}
										<div>
											<span class="font-semibold">Personal Phone:</span>
											<span class="ml-2">{director.personalPhone}</span>
										</div>
									{/if}
								</div>
							</div>

							<!-- Funeral Home Information -->
							<div class="space-y-3">
								<h4 class="h4 text-surface-600 dark:text-surface-300">Funeral Home Information</h4>
								<div class="space-y-2 text-sm">
									{#if director.funeralHomeName}
										<div>
											<span class="font-semibold">Name:</span>
											<span class="ml-2">{director.funeralHomeName}</span>
										</div>
									{/if}
									{#if director.funeralHomeAddress}
										<div>
											<span class="font-semibold">Address:</span>
											<span class="ml-2">{director.funeralHomeAddress}</span>
										</div>
									{/if}
									{#if director.funeralHomeEmail}
										<div>
											<span class="font-semibold">Email:</span>
											<span class="ml-2">{director.funeralHomeEmail}</span>
										</div>
									{/if}
									{#if director.funeralHomePhone}
										<div>
											<span class="font-semibold">Phone:</span>
											<span class="ml-2">{director.funeralHomePhone}</span>
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="container mx-auto px-4 py-8 text-center">
		<h1 class="h1 mb-4">Access Denied</h1>
		<p class="text-secondary">You don't have permission to access this page.</p>
		<a href="/" class="btn variant-filled-primary mt-4">Go Home</a>
	</div>
{/if}
