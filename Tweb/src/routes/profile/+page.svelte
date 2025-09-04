<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { updateProfile, requestEmailChange, updateUserPassword, refreshUserProfile } from '$lib/firebase/profile';
	import type { ProfileUpdateData, EmailUpdateRequest, PasswordUpdateRequest } from '$lib/firebase/profile';
	
	// Redirect if not logged in
	$: if (!$authStore.user && $authStore.initialized) {
		goto('/login');
	}

	// Edit states
	let editingName = false;
	let editingPhone = false;
	let editingEmail = false;
	let editingPassword = false;

	// Form data
	let displayName = '';
	let phone = '';
	let newEmail = '';
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';

	// Loading and error states
	let loading = {
		name: false,
		phone: false,
		email: false,
		password: false
	};
	let errors = {
		name: '',
		phone: '',
		email: '',
		password: ''
	};
	let success = {
		name: '',
		phone: '',
		email: '',
		password: ''
	};

	// Initialize form data when profile loads
	$: if ($authStore.profile) {
		displayName = $authStore.profile.displayName || '';
		phone = $authStore.profile.phone || '';
	}

	function startEditName() {
		editingName = true;
		displayName = $authStore.profile?.displayName || '';
		errors.name = '';
		success.name = '';
	}

	function cancelEditName() {
		editingName = false;
		displayName = $authStore.profile?.displayName || '';
		errors.name = '';
	}

	async function saveDisplayName() {
		if (!displayName.trim()) {
			errors.name = 'Name cannot be empty';
			return;
		}

		loading.name = true;
		errors.name = '';

		const result = await updateProfile({ displayName: displayName.trim() });
		
		if (result.success) {
			success.name = 'Name updated successfully';
			editingName = false;
			// Refresh profile data
			await refreshUserProfile();
		} else {
			errors.name = result.error || 'Failed to update name';
		}

		loading.name = false;
	}

	function startEditPhone() {
		editingPhone = true;
		phone = $authStore.profile?.phone || '';
		errors.phone = '';
		success.phone = '';
	}

	function cancelEditPhone() {
		editingPhone = false;
		phone = $authStore.profile?.phone || '';
		errors.phone = '';
	}

	async function savePhone() {
		loading.phone = true;
		errors.phone = '';

		const result = await updateProfile({ phone: phone.trim() });
		
		if (result.success) {
			success.phone = 'Phone number updated successfully';
			editingPhone = false;
			// Refresh profile data
			await refreshUserProfile();
		} else {
			errors.phone = result.error || 'Failed to update phone number';
		}

		loading.phone = false;
	}

	function startEditEmail() {
		editingEmail = true;
		newEmail = '';
		currentPassword = '';
		errors.email = '';
		success.email = '';
	}

	function cancelEditEmail() {
		editingEmail = false;
		newEmail = '';
		currentPassword = '';
		errors.email = '';
	}

	async function saveEmail() {
		if (!newEmail.trim()) {
			errors.email = 'Email cannot be empty';
			return;
		}

		if (!currentPassword) {
			errors.email = 'Current password is required';
			return;
		}

		if (!newEmail.includes('@')) {
			errors.email = 'Please enter a valid email address';
			return;
		}

		loading.email = true;
		errors.email = '';

		const request: EmailUpdateRequest = {
			newEmail: newEmail.trim(),
			currentPassword
		};

		const result = await requestEmailChange(request);
		
		if (result.success) {
			success.email = 'Email updated! Please check your new email for verification.';
			editingEmail = false;
			newEmail = '';
			currentPassword = '';
			// Refresh profile data
			await refreshUserProfile();
		} else {
			errors.email = result.error || 'Failed to update email';
		}

		loading.email = false;
	}

	function startEditPassword() {
		editingPassword = true;
		newPassword = '';
		confirmPassword = '';
		errors.password = '';
		success.password = '';
	}

	function cancelEditPassword() {
		editingPassword = false;
		newPassword = '';
		confirmPassword = '';
		errors.password = '';
	}

	async function savePassword() {
		if (!newPassword) {
			errors.password = 'New password is required';
			return;
		}

		if (newPassword.length < 6) {
			errors.password = 'Password must be at least 6 characters';
			return;
		}

		if (newPassword !== confirmPassword) {
			errors.password = 'Passwords do not match';
			return;
		}

		loading.password = true;
		errors.password = '';

		const request: PasswordUpdateRequest = {
			newPassword
		};

		const result = await updateUserPassword(request);
		loading.password = false;
		if (result.success) {
			success.password = 'Password updated successfully';
			editingPassword = false;
			newPassword = '';
			confirmPassword = '';
		} else {
			errors.password = result.error || 'Failed to update password';
		}
		
		// Clear success message after 5 seconds
		if (result.success) {
			setTimeout(() => {
				success.password = '';
			}, 5000);
		}
	}

	// Clear success messages after 5 seconds
	$: if (success.name) setTimeout(() => success.name = '', 5000);
	$: if (success.phone) setTimeout(() => success.phone = '', 5000);
	$: if (success.email) setTimeout(() => success.email = '', 5000);
</script>

<svelte:head>
	<title>Profile - Your App</title>
	<meta name="description" content="User profile page" />
</svelte:head>

{#if $authStore.user && $authStore.profile}
	<!-- Law of Proximity & Visual Hierarchy -->
	<div class="max-w-4xl mx-auto p-6 space-y-8">
		<!-- Profile Header - Von Restorff Effect -->
		<div class="card p-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
			<div class="flex items-center space-x-6">
				<div class="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
					{($authStore.profile.displayName || $authStore.user.email || 'U').charAt(0).toUpperCase()}
				</div>
				<div class="flex-1">
					<h1 class="h1 mb-2">Profile Settings</h1>
					<p class="text-lg text-secondary mb-4">Manage your account information and preferences</p>
					<div class="flex items-center space-x-4">
						<span class="badge variant-filled-{$authStore.profile.role === 'Owner' ? 'primary' : 'secondary'}">
							{$authStore.profile.role}
						</span>
						<span class="text-sm text-tertiary">
							Member since {typeof $authStore.profile.createdAt === 'object' && 'toDate' in $authStore.profile.createdAt ? $authStore.profile.createdAt.toDate().toLocaleDateString() : new Date($authStore.profile.createdAt).toLocaleDateString()}
						</span>
					</div>
				</div>
			</div>
		</div>

	<!-- Personal Information Section - Law of Common Region -->
	<div class="card p-6">
		<h2 class="h2 mb-6 flex items-center">
			<svg class="w-6 h-6 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
			</svg>
			Personal Information
		</h2>
		<!-- Display Name - Hick's Law (simple edit interface) -->
		<div class="space-y-4 pb-6 border-b border-surface-200 dark:border-surface-700">
			<label for="displayName" class="label">
				<span class="font-semibold">Display Name</span>
			</label>
			{#if editingName}
				<div class="flex flex-col sm:flex-row gap-3">
					<input
						id="displayName"
						type="text"
						bind:value={displayName}
						class="input flex-1"
						placeholder="Enter your display name"
						disabled={loading.name}
					/>
					<div class="flex gap-2">
						<button
							type="button"
							class="btn variant-filled-primary"
							on:click={saveDisplayName}
							disabled={loading.name}
						>
							{loading.name ? 'Saving...' : 'Save'}
						</button>
						<button
							type="button"
							class="btn variant-ghost-surface"
							on:click={() => { editingName = false; displayName = $authStore.profile?.displayName || ''; }}
							disabled={loading.name}
						>
							Cancel
						</button>
					</div>
				</div>
			{:else}
				<div class="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
					<span class="text-lg">{$authStore.profile.displayName || 'Not set'}</span>
					<button
						type="button"
						class="btn variant-ghost-primary btn-sm"
						on:click={() => editingName = true}
					>
						Edit
					</button>
				</div>
			{/if}
			{#if errors.name}
				<aside class="alert variant-filled-error mt-2">
					<div class="alert-message">
						<p>{errors.name}</p>
					</div>
				</aside>
			{/if}
			{#if success.name}
				<aside class="alert variant-filled-success mt-2">
					<div class="alert-message">
						<p>{success.name}</p>
					</div>
				</aside>
			{/if}
		</div>

				<!-- Phone Number Section -->
				<div class="info-group">
					{#if editingPhone}
						<label for="phone-input">Phone Number</label>
						<div class="edit-form">
							<input
								id="phone-input"
								type="tel"
								bind:value={phone}
								placeholder="Enter your phone number"
								class="edit-input"
								disabled={loading.phone}
							/>
							<div class="edit-actions">
								<button class="btn btn-save" on:click={savePhone} disabled={loading.phone}>
									{loading.phone ? 'Saving...' : 'Save'}
								</button>
								<button class="btn btn-cancel" on:click={cancelEditPhone} disabled={loading.phone}>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<div class="display-row">
							<span class="label-text">Phone Number</span>
							<p>{$authStore.profile.phone || 'Not set'}</p>
							<button class="btn btn-edit" on:click={startEditPhone}>Edit</button>
						</div>
					{/if}
					{#if errors.phone}
						<aside class="alert variant-filled-error mt-2">
							<div class="alert-message">
								<p>{errors.phone}</p>
							</div>
						</aside>
					{/if}
					{#if success.phone}
						<aside class="alert variant-filled-success mt-2">
							<div class="alert-message">
								<p>{success.phone}</p>
							</div>
						</aside>
					{/if}
				</div>

				<!-- Email Section -->
				<div class="info-group">
					{#if editingEmail}
						<label for="email-input">Email</label>
						<div class="edit-form">
							<input
								id="email-input"
								type="email"
								bind:value={newEmail}
								placeholder="Enter new email"
								class="edit-input"
								disabled={loading.email}
							/>
							<input
								type="password"
								bind:value={currentPassword}
								placeholder="Current password (required)"
								class="edit-input"
								disabled={loading.email}
							/>
							<div class="edit-actions">
								<button class="btn btn-save" on:click={saveEmail} disabled={loading.email}>
									{loading.email ? 'Updating...' : 'Update Email'}
								</button>
								<button class="btn btn-cancel" on:click={cancelEditEmail} disabled={loading.email}>
									Cancel
								</button>
							</div>
							<p class="help-text">A verification email will be sent to your new address.</p>
						</div>
					{:else}
						<div class="display-row">
							<span class="label-text">Email</span>
							<p>{$authStore.profile.email}</p>
							<button class="btn btn-edit" on:click={startEditEmail}>Edit</button>
						</div>
					{/if}
					{#if errors.email}
						<aside class="alert variant-filled-error mt-2">
							<div class="alert-message">
								<p>{errors.email}</p>
							</div>
						</aside>
					{/if}
					{#if success.email}
						<aside class="alert variant-filled-success mt-2">
							<div class="alert-message">
								<p>{success.email}</p>
							</div>
						</aside>
					{/if}
				</div>

				<!-- Password Section -->
				<div class="info-group">
					{#if editingPassword}
						<label for="password-input">Password</label>
						<div class="edit-form">
							<input
								id="password-input"
								type="password"
								bind:value={newPassword}
								placeholder="Enter new password"
								class="edit-input"
								disabled={loading.password}
							/>
							<input
								type="password"
								bind:value={confirmPassword}
								placeholder="Confirm new password"
								class="edit-input"
								disabled={loading.password}
							/>
							<div class="edit-actions">
								<button class="btn btn-save" on:click={savePassword} disabled={loading.password}>
									{loading.password ? 'Updating...' : 'Update Password'}
								</button>
								<button class="btn btn-cancel" on:click={cancelEditPassword} disabled={loading.password}>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<div class="display-row">
							<span class="label-text">Password</span>
							<p>••••••••</p>
							<button class="btn btn-edit" on:click={startEditPassword}>Change</button>
						</div>
					{/if}
					{#if errors.password}
						<aside class="alert variant-filled-error mt-2">
							<div class="alert-message">
								<p>{errors.password}</p>
							</div>
						</aside>
					{/if}
					{#if success.password}
						<aside class="alert variant-filled-success mt-2">
							<div class="alert-message">
								<p>{success.password}</p>
							</div>
						</aside>
					{/if}
				</div>

				<!-- Role Section -->
				<div class="info-group">
					<div class="display-row">
						<span class="label-text">Role</span>
						<p class="role-badge role-{$authStore.profile.role.toLowerCase()}">
							{$authStore.profile.role}
						</p>
					</div>
				</div>

				<!-- Member Since Section -->
				<div class="info-group">
					<div class="display-row">
						<span class="label-text">Member Since</span>
						<p>{typeof $authStore.profile.createdAt === 'object' && 'toDate' in $authStore.profile.createdAt ? $authStore.profile.createdAt.toDate().toLocaleDateString() : new Date($authStore.profile.createdAt).toLocaleDateString()}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else if $authStore.loading}
	<div class="flex flex-col items-center justify-center py-20">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
		<p class="text-lg text-secondary">Loading profile...</p>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center py-20">
		<p class="text-lg text-secondary">Please log in to view your profile.</p>
	</div>
{/if}
