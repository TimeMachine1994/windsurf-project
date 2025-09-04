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

<!-- Header - Jakob's Law (familiar navigation pattern) & Fitts's Law (larger targets) -->
<header class="bg-white dark:bg-surface-900 shadow-lg border-b border-surface-200 dark:border-surface-700">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo - Law of Proximity (grouped with brand) -->
			<div class="flex items-center">
				<a href="/" class="flex items-center space-x-2 text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
					<div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
						<span class="text-white font-bold text-sm">T</span>
					</div>
					<span>Tributestream</span>
				</a>
			</div>
			
			<!-- Navigation - Miller's Rule (limited menu items) -->
			<div class="hidden lg:flex items-center justify-end flex-1">
				<nav class="flex items-center space-x-8">
					<a href="/for-families" 
						class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors">
						For Families
					</a>
					<a href="/for-funeral-homes" 
						class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors">
						For Funeral Homes
					</a>
					<a href="/create-memorial" 
						class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors">
						Create Memorial
					</a>
					<a href="/contact" 
						class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors">
						Contact Us
					</a>
					<!-- Von Restorff Effect - CTA stands out -->
					<a href={$authStore.user ? "/booking" : "/login"} 
						class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md">
						Get Started
					</a>
				</nav>
			</div>
			
			<!-- User Menu & Mobile Menu -->
			<div class="flex items-center space-x-4">
				{#if $authStore.loading}
					<div class="text-surface-500 text-sm">Loading...</div>
				{:else if $authStore.user}
					<!-- User Menu - Law of Proximity (grouped user actions) -->
					<div class="relative">
						<button 
							class="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
							on:click={toggleUserMenu}
							aria-label="User menu"
						>
							<div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
								{($authStore.profile?.displayName || $authStore.user.email || '').charAt(0).toUpperCase()}
							</div>
							<div class="hidden sm:block text-left">
								<div class="text-sm font-medium text-surface-900 dark:text-surface-100">
									{$authStore.profile?.displayName || $authStore.user.email}
								</div>
								<div class="text-xs text-surface-500 dark:text-surface-400">
									{$authStore.profile?.role || 'Viewer'}
								</div>
							</div>
							<svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
							</svg>
						</button>
						
						{#if showUserMenu}
							<!-- Law of Common Region - grouped menu items -->
							<div class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-800 rounded-lg shadow-xl border border-surface-200 dark:border-surface-600 z-50">
								<div class="py-2">
									<a href="/profile" 
										class="flex items-center px-4 py-3 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
										<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
										</svg>
										Profile Settings
									</a>
									{#if $authStore.profile?.role === 'Owner'}
										<a href="/slideshow-manager" 
											class="flex items-center px-4 py-3 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
											<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
											</svg>
											Slideshow Manager
										</a>
									{/if}
									<a href="/schedule" 
										class="flex items-center px-4 py-3 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
										<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"/>
										</svg>
										{$authStore.profile?.role === 'FuneralDirector' ? 'Dashboard' : 'Livestream Schedule'}
									</a>
									{#if $authStore.profile?.role === 'Admin'}
										<a href="/admin/funeral-directors" 
											class="flex items-center px-4 py-3 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
											<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
											</svg>
											Funeral Director Approvals
										</a>
									{/if}
									<hr class="my-2 border-surface-200 dark:border-surface-600">
									<button 
										class="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
										on:click={handleSignOut}>
										<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
										</svg>
										Sign Out
									</button>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Auth Actions - Hick's Law (simplified choices) -->
					<div class="flex items-center space-x-3">
						<a href="/login" 
							class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 text-sm font-medium transition-colors">
							Sign In
						</a>
						<a href="/register" 
							class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 text-sm font-medium transition-colors">
							Register
						</a>
					</div>
				{/if}
				
				<!-- Mobile Menu Button - Fitts's Law (larger touch target) -->
				<button 
					class="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
					aria-label="Open mobile menu">
					<svg class="w-6 h-6 text-surface-600 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</header>

