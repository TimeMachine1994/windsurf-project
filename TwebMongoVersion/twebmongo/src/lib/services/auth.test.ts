import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { authService, user, isAuthenticated, isLoading } from './auth';

// Mock the Auth0 module
vi.mock('@auth0/auth0-spa-js');

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    user.set(null);
    isAuthenticated.set(false);
    isLoading.set(true);
  });

  it('should initialize Auth0 client', async () => {
    await authService.initialize();
    
    expect(get(isLoading)).toBe(false);
  });

  it('should handle login redirect', async () => {
    const mockLoginWithRedirect = vi.fn();
    const mockClient = {
      loginWithRedirect: mockLoginWithRedirect,
      isAuthenticated: vi.fn(() => Promise.resolve(false)),
      getUser: vi.fn(() => Promise.resolve(null))
    };

    const { createAuth0Client } = await import('@auth0/auth0-spa-js');
    vi.mocked(createAuth0Client).mockResolvedValue(mockClient);

    await authService.initialize();
    await authService.login();

    expect(mockLoginWithRedirect).toHaveBeenCalled();
  });

  it('should handle callback and set user', async () => {
    const mockUser = {
      sub: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    };

    const mockHandleCallback = vi.fn();
    const mockGetUser = vi.fn(() => Promise.resolve(mockUser));
    const mockClient = {
      handleRedirectCallback: mockHandleCallback,
      getUser: mockGetUser,
      isAuthenticated: vi.fn(() => Promise.resolve(true))
    };

    const { createAuth0Client } = await import('@auth0/auth0-spa-js');
    vi.mocked(createAuth0Client).mockResolvedValue(mockClient);

    await authService.initialize();
    await authService.handleCallback();

    expect(mockHandleCallback).toHaveBeenCalled();
    expect(get(isAuthenticated)).toBe(true);
    expect(get(user)).toEqual({
      id: mockUser.sub,
      email: mockUser.email,
      name: mockUser.name
    });
  });

  it('should handle logout', async () => {
    const mockLogout = vi.fn();
    const mockClient = {
      logout: mockLogout,
      isAuthenticated: vi.fn(() => Promise.resolve(false)),
      getUser: vi.fn(() => Promise.resolve(null))
    };

    const { createAuth0Client } = await import('@auth0/auth0-spa-js');
    vi.mocked(createAuth0Client).mockResolvedValue(mockClient);

    await authService.initialize();
    await authService.logout();

    expect(mockLogout).toHaveBeenCalledWith({
      logoutParams: { returnTo: 'http://localhost:5173' }
    });
    expect(get(isAuthenticated)).toBe(false);
    expect(get(user)).toBe(null);
  });
});
