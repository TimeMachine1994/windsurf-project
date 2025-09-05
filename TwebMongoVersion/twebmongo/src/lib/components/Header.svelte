<script lang="ts">
	import { authService, user, isAuthenticated } from '$lib/services/auth-mock';

	console.log('🧭 HEADER: Component loading');

	async function handleLogin() {
		console.log('🧭 HEADER: Login clicked');
		await authService.login();
		console.log('🧭 HEADER: Login completed');
	}

	async function handleLogout() {
		console.log('🧭 HEADER: Logout clicked');
		await authService.logout();
		console.log('🧭 HEADER: Logout completed');
	}

	// Log auth state changes
	$: {
		console.log('🧭 HEADER: Auth state changed - isAuthenticated:', $isAuthenticated, 'user:', $user);
	}
</script>

<header class="bg-white border-b">
	<div class="max-w-7xl mx-auto" style="padding-left: 1rem; padding-right: 1rem;">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex items-center gap-2">
				<a href="/" class="flex items-center gap-2">
					<span class="text-2xl">🏠</span>
					<span class="font-semibold text-lg">TributeStream</span>
				</a>
			</div>

			<!-- Nav -->
			<nav class="hidden md:flex gap-6 text-sm text-gray-600 items-center">
				<a href="/create-memorial" class="hover:text-gray-900">Create Memorial</a>
				<a href="/for-families" class="hover:text-gray-900">For Families</a>
				<a href="/for-funeral-homes" class="hover:text-gray-900">For Funeral Homes</a>
				<a href="/calculator" class="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors">
					Price Calculator
				</a>
			</nav>

			<!-- Auth -->
			<div class="flex items-center gap-3">
				{#if $isAuthenticated && $user}
					{#if !$user.role || $user.role === 'Viewer'}
						<a href="/create-memorial" class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-1">
							<span>➕</span>
							<span>Create Memorial</span>
						</a>
					{/if}
					
					<!-- User Menu Dropdown -->
					<div class="relative group">
						<button class="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100">
							<span>👤</span>
							<span>{$user.name || $user.email}</span>
							<span class="text-xs">▼</span>
						</button>
						
						<!-- Dropdown Menu -->
						<div class="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
							<div class="py-1">
								<a href="/profile" class="block text-sm text-gray-700 hover:bg-gray-100" style="padding: 0.5rem 1rem;">
									👤 My Profile
								</a>
								<a href="/my-memorials" class="block text-sm text-gray-700 hover:bg-gray-100" style="padding: 0.5rem 1rem;">
									📋 My Memorials
								</a>
								<div class="border-t border-gray-100"></div>
								<button 
									on:click={handleLogout}
									class="block w-full text-left text-sm text-gray-700 hover:bg-gray-100" style="padding: 0.5rem 1rem;"
								>
									🚪 Logout
								</button>
							</div>
						</div>
					</div>
				{:else}
					<button class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-1" on:click={handleLogin}>
						<span>🔑</span>
						<span>Login</span>
					</button>
				{/if}
			</div>
		</div>
	</div>
</header>
