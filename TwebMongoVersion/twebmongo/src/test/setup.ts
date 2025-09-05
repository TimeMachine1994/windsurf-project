/// <reference types="vitest" />
import '@testing-library/jest-dom';

// Mock Auth0 for testing
vi.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: vi.fn(() => Promise.resolve({
    isAuthenticated: vi.fn(() => Promise.resolve(false)),
    loginWithRedirect: vi.fn(() => Promise.resolve()),
    logout: vi.fn(() => Promise.resolve()),
    handleRedirectCallback: vi.fn(() => Promise.resolve()),
    getUser: vi.fn(() => Promise.resolve({
      sub: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    })),
    getTokenSilently: vi.fn(() => Promise.resolve('mock-token'))
  }))
}));

// Mock SvelteKit environment
vi.mock('$app/environment', () => ({
  browser: true,
  dev: true
}));

// Mock environment variables
vi.mock('$env/static/public', () => ({
  PUBLIC_AUTH0_DOMAIN: 'test-domain.auth0.com',
  PUBLIC_AUTH0_CLIENT_ID: 'test-client-id',
  PUBLIC_AUTH0_AUDIENCE: 'https://api.test.com',
  PUBLIC_APP_URL: 'http://localhost:5173'
}));
