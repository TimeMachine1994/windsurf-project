<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { UserProfile } from '$lib/firebase/auth';
	
	let profile: UserProfile | null = null;
	let loading = true;

	// Check if user is a funeral director
	$: if ($authStore.initialized && (!$authStore.user || !$authStore.profile || $authStore.profile.role !== 'FuneralDirector')) {
		goto('/profile');
	}

	$: if ($authStore.profile && $authStore.profile.role === 'FuneralDirector') {
		profile = $authStore.profile;
		loading = false;
	}

	function formatDate(date: Date | { toDate(): Date }): string {
		const d = date instanceof Date ? date : date.toDate();
		return d.toLocaleDateString();
	}

	function getApprovalStatus(): { text: string; variant: string; icon: string } {
		if (!profile) return { text: 'Unknown', variant: 'variant-filled-surface', icon: '❓' };
		
		if (profile.approved === true) {
			return { text: 'Approved', variant: 'variant-filled-success', icon: '✅' };
		} else if (profile.approved === false && profile.approvedAt) {
			return { text: 'Rejected', variant: 'variant-filled-error', icon: '❌' };
		} else {
			return { text: 'Pending Approval', variant: 'variant-filled-warning', icon: '⏳' };
		}
	}
</script>

<svelte:head>
	<title>Funeral Director Profile - TributeStream</title>
	<meta name="description" content="Funeral director profile and account information" />
</svelte:head>

{#if loading}
	<div class="flex items-center justify-center py-12">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
			<p class="text-secondary">Loading profile...</p>
		</div>
	</div>
{:else if profile}
	<div class="container mx-auto px-4 py-8">
		<div class="max-w-4xl mx-auto">
			<!-- Header -->
			<div class="flex items-center justify-between mb-8">
				<div>
					<h1 class="h1">Funeral Director Profile</h1>
					<p class="text-secondary">Manage your professional account information</p>
				</div>
				<div class="flex items-center space-x-4">
					{@const status = getApprovalStatus()}
					<span class="badge {status.variant}">
						{status.icon} {status.text}
					</span>
				</div>
			</div>

			<!-- Approval Status Card -->
			{#if !profile.approved}
				<div class="card p-6 mb-8 border-l-4 border-warning-500">
					<div class="flex items-start space-x-4">
						<div class="text-warning-600 dark:text-warning-400 text-2xl">
							⏳
						</div>
						<div>
							<h3 class="h3 text-warning-800 dark:text-warning-200 mb-2">Account Pending Approval</h3>
							<p class="text-warning-700 dark:text-warning-300 mb-4">
								Your funeral director account is currently under review by our administrators. 
								You will receive an email notification once your account is approved.
							</p>
							<p class="text-sm text-warning-600 dark:text-warning-400">
								This process typically takes 1-2 business days. Thank you for your patience.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Personal Information -->
				<div class="card p-6">
					<h2 class="h2 mb-6 text-primary-500">Personal Information</h2>
					<div class="space-y-4">
						<div>
							<label class="label text-sm font-semibold text-surface-600 dark:text-surface-300">Full Name</label>
							<p class="text-lg">{profile.displayName || 'Not provided'}</p>
						</div>
						<div>
							<label class="label text-sm font-semibold text-surface-600 dark:text-surface-300">Email Address</label>
							<p class="text-lg">{profile.email}</p>
						</div>
						{#if profile.personalPhone}
							<div>
								<label class="label text-sm font-semibold text-surface-600 dark:text-surface-300">Personal Phone</label>
								<p class="text-lg">{profile.personalPhone}</p>
							</div>
						{/if}
						<div>
							<label class="label text-sm font-semibold text-surface-600 dark:text-surface-300">Account Created</label>
							<p class="text-lg">{formatDate(profile.createdAt)}</p>
						</div>
					</div>
				</div>

				<!-- Funeral Home Information -->
				<div class="card p-6">
					<h2 class="h2 mb-6 text-primary-500">Funeral Home Information</h2>
					<div class="space-y-4">
						{#if profile.funeralHomeName}
							<div>
								<label class="label text-sm font-semibold text-surface-600 dark:text-surface-300">Funeral Home Name</label>
								<p class="text-lg">{profile.funeralHomeName}</p>
							</div>
						{/if}
						{#if profile.funeralHomeAddress}
							<div>
								<label class="label text-sm font-semibold text-surface-600 dark:text-surface-300">Address</label>
								<p class="text-lg whitespace-pre-line">{profile.funeralHomeAddress}</p>
							</div>
						{/if}
						{#if profile.funeralHomeEmail}
							<div>
								<label class="label text-sm font-semibold text-surface-600 dark:text-surface-300">Business Email</label>
								<p class="text-lg">{profile.funeralHomeEmail}</p>
							</div>
						{/if}
						{#if profile.funeralHomePhone}
							<div>
								<label class="label text-sm font-semibold text-surface-600 dark:text-surface-300">Business Phone</label>
								<p class="text-lg">{profile.funeralHomePhone}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Account Status -->
			<div class="card p-6 mt-8">
				<h2 class="h2 mb-6 text-primary-500">Account Status</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="text-center">
						<div class="text-3xl mb-2">👤</div>
						<h3 class="h3 mb-1">Role</h3>
						<p class="text-secondary">Funeral Director</p>
					</div>
					<div class="text-center">
						<div class="text-3xl mb-2">{getApprovalStatus().icon}</div>
						<h3 class="h3 mb-1">Status</h3>
						<p class="text-secondary">{getApprovalStatus().text}</p>
					</div>
					<div class="text-center">
						<div class="text-3xl mb-2">📅</div>
						<h3 class="h3 mb-1">Member Since</h3>
						<p class="text-secondary">{formatDate(profile.createdAt)}</p>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex justify-center space-x-4 mt-8">
				{#if profile.approved}
					<a href="/schedule" class="btn variant-filled-primary">
						Go to Dashboard
					</a>
				{/if}
				<a href="/profile" class="btn variant-filled-secondary">
					Back to Profile
				</a>
			</div>
		</div>
	</div>
{:else}
	<div class="container mx-auto px-4 py-8 text-center">
		<h1 class="h1 mb-4">Profile Not Found</h1>
		<p class="text-secondary">Unable to load your profile information.</p>
		<a href="/" class="btn variant-filled-primary mt-4">Go Home</a>
	</div>
{/if}
