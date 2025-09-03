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
	<div class="profile-page">
		<div class="container">
			<div class="profile-card">
				<h1>User Profile</h1>
				
				<div class="profile-info">
					<!-- Display Name Section -->
					<div class="info-group">
						<label>Display Name</label>
						{#if editingName}
							<div class="edit-form">
								<input
									type="text"
									bind:value={displayName}
									placeholder="Enter your name"
									class="edit-input"
									disabled={loading.name}
								/>
								<div class="edit-actions">
									<button class="btn btn-save" on:click={saveDisplayName} disabled={loading.name}>
										{loading.name ? 'Saving...' : 'Save'}
									</button>
									<button class="btn btn-cancel" on:click={cancelEditName} disabled={loading.name}>
										Cancel
									</button>
								</div>
							</div>
						{:else}
							<div class="display-row">
								<p>{$authStore.profile.displayName || 'Not set'}</p>
								<button class="btn btn-edit" on:click={startEditName}>Edit</button>
							</div>
						{/if}
						{#if errors.name}
							<p class="error-message">{errors.name}</p>
						{/if}
						{#if success.name}
							<p class="success-message">{success.name}</p>
						{/if}
					</div>

					<!-- Phone Number Section -->
					<div class="info-group">
						<label>Phone Number</label>
						{#if editingPhone}
							<div class="edit-form">
								<input
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
								<p>{$authStore.profile.phone || 'Not set'}</p>
								<button class="btn btn-edit" on:click={startEditPhone}>Edit</button>
							</div>
						{/if}
						{#if errors.phone}
							<p class="error-message">{errors.phone}</p>
						{/if}
						{#if success.phone}
							<p class="success-message">{success.phone}</p>
						{/if}
					</div>

					<!-- Email Section -->
					<div class="info-group">
						<label>Email</label>
						{#if editingEmail}
							<div class="edit-form">
								<input
									type="email"
									bind:value={newEmail}
									placeholder="Enter new email address"
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
								<p>{$authStore.user.email}</p>
								<button class="btn btn-edit" on:click={startEditEmail}>Edit</button>
							</div>
						{/if}
						{#if errors.email}
							<p class="error-message">{errors.email}</p>
						{/if}
						{#if success.email}
							<p class="success-message">{success.email}</p>
						{/if}
					</div>

					<!-- Password Section -->
					<div class="info-group">
						<label>Password</label>
						{#if editingPassword}
							<div class="edit-form">
								<input
									type="password"
									bind:value={newPassword}
									placeholder="New password (min 6 characters)"
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
								<p>••••••••</p>
								<button class="btn btn-edit" on:click={startEditPassword}>Change Password</button>
							</div>
						{/if}
						{#if errors.password}
							<p class="error-message">{errors.password}</p>
						{/if}
						{#if success.password}
							<p class="success-message">{success.password}</p>
						{/if}
					</div>
					
					<!-- Read-only fields -->
					<div class="info-group">
						<label>Role</label>
						<p class="role-badge role-{$authStore.profile.role.toLowerCase()}">
							{$authStore.profile.role}
						</p>
					</div>
					
					<div class="info-group">
						<label>Member Since</label>
						<p>{$authStore.profile.createdAt?.toDate?.() ? $authStore.profile.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
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

	.display-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.edit-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.edit-input {
		padding: 0.75rem;
		border: 2px solid #e5e7eb;
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: border-color 0.2s ease;
	}

	.edit-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.edit-input:disabled {
		background-color: #f9fafb;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.edit-actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 80px;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-edit {
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.btn-edit:hover:not(:disabled) {
		background: #e5e7eb;
		border-color: #9ca3af;
	}

	.btn-save {
		background: linear-gradient(135deg, #059669 0%, #047857 100%);
		color: white;
	}

	.btn-save:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
	}

	.btn-cancel {
		background: #f9fafb;
		color: #6b7280;
		border: 1px solid #d1d5db;
	}

	.btn-cancel:hover:not(:disabled) {
		background: #f3f4f6;
		color: #374151;
	}

	.error-message {
		color: #dc2626;
		font-size: 0.875rem;
		margin: 0.5rem 0 0 0;
		padding: 0.5rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.375rem;
	}

	.success-message {
		color: #059669;
		font-size: 0.875rem;
		margin: 0.5rem 0 0 0;
		padding: 0.5rem;
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 0.375rem;
	}

	.help-text {
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0;
		font-style: italic;
	}

	@media (max-width: 768px) {
		.display-row {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}

		.edit-actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}
	}
</style>
