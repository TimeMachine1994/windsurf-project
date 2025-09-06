// Mock auth service for testing when Auth0 is not configured
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface SessionUser {
	id?: string;
	email?: string;
	name?: string;
	role?: 'Viewer' | 'Owner' | 'Admin' | 'FuneralDirector';
}

export const user = writable<SessionUser | null>(null);
export const isLoading = writable<boolean>(false);
export const isAuthenticated = writable<boolean>(false);

// Initialize immediately when module loads
if (browser) {
	console.log('🔐 AUTH: Auto-initializing on module load...');
	const mockUser = {
		id: 'mock-user-123',
		email: 'test@example.com',
		name: 'Test User',
		role: 'Owner' as const
	};
	user.set(mockUser);
	isAuthenticated.set(true);
	isLoading.set(false);
	console.log('🔐 AUTH: Auto-initialization complete');
}

class MockAuthService {
	async initialize() {
		// Only initialize on client side
		if (!browser) return;
		
		console.log('🔐 AUTH: Starting initialization...');
		
		// Mock initialization - simulate logged in user for testing
		const mockUser = {
			id: 'mock-user-123',
			email: 'test@example.com',
			name: 'Test User',
			role: 'Owner' as const
		};
		
		console.log('🔐 AUTH: Setting mock user:', mockUser);
		user.set(mockUser);
		isAuthenticated.set(true);
		isLoading.set(false);
		
		console.log('🔐 AUTH: Initialization complete');
	}

	async login() {
		// Mock login - simulate successful login
		const mockUser = {
			id: 'mock-user-123',
			email: 'test@example.com',
			name: 'Test User',
			role: 'Owner' as const
		};
		user.set(mockUser);
		isAuthenticated.set(true);
	}

	async logout() {
		user.set(null);
		isAuthenticated.set(false);
	}

	async handleCallback() {
		// Mock callback handling
		await this.login();
	}

	async getAccessToken(): Promise<string> {
		return 'mock-access-token';
	}

	hasRole(r: SessionUser['role']): boolean {
		let current: SessionUser | null = null;
		const unsubscribe = user.subscribe((val) => (current = val));
		unsubscribe();
		return current?.role === r || false;
	}
}

export const authService = new MockAuthService();
