import { createAuth0Client, type Auth0Client } from '@auth0/auth0-spa-js';
import { writable } from 'svelte/store';
import { PUBLIC_AUTH0_DOMAIN, PUBLIC_AUTH0_CLIENT_ID, PUBLIC_AUTH0_AUDIENCE, PUBLIC_APP_URL } from '$env/static/public';

export interface SessionUser {
	id?: string;
	email?: string;
	name?: string;
	role?: 'Viewer' | 'Owner' | 'Admin' | 'FuneralDirector';
}

export const user = writable<SessionUser | null>(null);
export const isLoading = writable<boolean>(true);
export const isAuthenticated = writable<boolean>(false);

class AuthService {
	private auth0Client: Auth0Client | null = null;

	async initialize() {
		try {
			this.auth0Client = await createAuth0Client({
				domain: PUBLIC_AUTH0_DOMAIN,
				clientId: PUBLIC_AUTH0_CLIENT_ID,
				authorizationParams: {
					redirect_uri: window.location.origin + '/auth/callback'
				},
				cacheLocation: 'localstorage'
			});

			const authed = await this.auth0Client.isAuthenticated();
			isAuthenticated.set(authed);
			if (authed) await this.loadUser();
		} catch (err) {
			console.error('Auth initialization failed', err);
		} finally {
			isLoading.set(false);
		}
	}

	async login() {
		if (!this.auth0Client) throw new Error('Auth0 not initialized');
		await this.auth0Client.loginWithRedirect();
	}

	async logout() {
		if (!this.auth0Client) throw new Error('Auth0 not initialized');
		await this.auth0Client.logout({ logoutParams: { returnTo: PUBLIC_APP_URL } });
		user.set(null);
		isAuthenticated.set(false);
	}

	async handleCallback() {
		if (!this.auth0Client) throw new Error('Auth0 not initialized');
		try {
			await this.auth0Client.handleRedirectCallback();
			await this.loadUser();
			isAuthenticated.set(true);
		} catch (error) {
			console.error('Callback handling error:', error);
			throw error;
		}
	}

	async getAccessToken(): Promise<string> {
		if (!this.auth0Client) throw new Error('Auth0 not initialized');
		return await this.auth0Client.getTokenSilently();
	}

	private async loadUser() {
		if (!this.auth0Client) return;
		const u = await this.auth0Client.getUser();
		if (!u) return;
		user.set({ id: u.sub, email: u.email, name: u.name });
	}

	hasRole(r: SessionUser['role']): boolean {
		let current: SessionUser | null = null;
		user.subscribe((val) => (current = val))();
		return current?.role === r;
	}
}

export const authService = new AuthService();
