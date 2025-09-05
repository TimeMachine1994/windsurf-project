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

class MockAuthService {
	async initialize() {
		// Only initialize on client side
		if (!browser) return;
		
		// Mock initialization - set as not authenticated
		isAuthenticated.set(false);
		isLoading.set(false);
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
		user.subscribe((val) => (current = val))();
		return current?.role === r;
	}
}

export const authService = new MockAuthService();
