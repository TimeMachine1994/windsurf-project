/**
 * Authentication Service for MongoDB + Auth0
 * Replaces Firebase Auth with Auth0 integration
 */

import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js';
import { connectToDatabase } from '../mongodb/connection';
import type { User } from '../types/user';
import { ObjectId } from 'mongodb';
import { writable } from 'svelte/store';

export interface AuthUser {
  _id: ObjectId;
  auth0Id: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: 'Viewer' | 'Owner' | 'Admin' | 'FuneralDirector';
  approved?: boolean;
  emailVerified: boolean;
  isAuthenticated: boolean;
}

class AuthService {
  private auth0Client: Auth0Client | null = null;
  private currentUser: AuthUser | null = null;
  
  // Svelte store for reactive authentication state
  public user = writable<AuthUser | null>(null);
  public isLoading = writable<boolean>(true);

  async initialize() {
    try {
      this.auth0Client = await createAuth0Client({
        domain: import.meta.env.VITE_AUTH0_DOMAIN,
        clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        authorizationParams: {
          redirect_uri: window.location.origin + '/callback',
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      });

      // Check if user is already authenticated
      const isAuthenticated = await this.auth0Client.isAuthenticated();
      if (isAuthenticated) {
        await this.loadCurrentUser();
      }
      
      this.isLoading.set(false);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.isLoading.set(false);
    }
  }

  async login(email?: string) {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');

    const loginOptions: any = {};
    if (email) {
      loginOptions.authorizationParams = { login_hint: email };
    }

    await this.auth0Client.loginWithRedirect(loginOptions);
  }

  async logout() {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');

    await this.auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
    
    this.currentUser = null;
    this.user.set(null);
  }

  async handleCallback() {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');

    try {
      await this.auth0Client.handleRedirectCallback();
      await this.loadCurrentUser();
      
      // Redirect to intended page or dashboard
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo') || '/';
      window.location.replace(returnTo);
    } catch (error) {
      console.error('Callback handling failed:', error);
      throw error;
    }
  }

  async loadCurrentUser(): Promise<AuthUser | null> {
    if (!this.auth0Client) return null;

    try {
      const auth0User = await this.auth0Client.getUser();
      if (!auth0User) return null;

      // Load or create MongoDB user record
      const mongoUser = await this.getOrCreateMongoUser(auth0User);
      
      this.currentUser = {
        ...mongoUser,
        isAuthenticated: true
      };

      this.user.set(this.currentUser);
      return this.currentUser;
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  }

  private async getOrCreateMongoUser(auth0User: any): Promise<AuthUser> {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Try to find existing user
    let mongoUser = await usersCollection.findOne({ auth0Id: auth0User.sub });

    if (!mongoUser) {
      // Create new user record
      const newUser = {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        displayName: auth0User.name || auth0User.email,
        role: 'Viewer', // Default role
        emailVerified: auth0User.email_verified || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      };

      const result = await usersCollection.insertOne(newUser);
      mongoUser = { ...newUser, _id: result.insertedId };
    } else {
      // Update last login
      await usersCollection.updateOne(
        { _id: mongoUser._id },
        { 
          $set: { 
            lastLoginAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
    }

    return mongoUser as AuthUser;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) return this.currentUser;
    return await this.loadCurrentUser();
  }

  async getAccessToken(): Promise<string> {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');
    return await this.auth0Client.getTokenSilently();
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.auth0Client) return false;
    return await this.auth0Client.isAuthenticated();
  }

  // Role checking methods
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.role || '');
  }

  isOwner(): boolean {
    return this.hasRole('Owner');
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isFuneralDirector(): boolean {
    return this.hasRole('FuneralDirector');
  }

  isApprovedFuneralDirector(): boolean {
    return this.isFuneralDirector() && this.currentUser?.approved === true;
  }

  // Memorial owner registration (for create-memorial flow)
  async registerMemorialOwner(userData: {
    email: string;
    displayName: string;
    phone: string;
  }): Promise<{ user: AuthUser; tempPassword: string }> {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const tempPassword = this.generateTempPassword();
    
    // Create user in MongoDB (Auth0 user will be created on first login)
    const newUser = {
      auth0Id: '', // Will be updated on first login
      email: userData.email,
      displayName: userData.displayName,
      phone: userData.phone,
      role: 'Owner',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    const user = { ...newUser, _id: result.insertedId, isAuthenticated: false } as AuthUser;

    return { user, tempPassword };
  }

  // Funeral director registration
  async registerFuneralDirector(userData: {
    email: string;
    displayName: string;
    funeralHomeName: string;
    funeralHomeAddress: string;
    funeralHomeEmail: string;
    funeralHomePhone: string;
    personalPhone: string;
  }): Promise<AuthUser> {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const newUser = {
      auth0Id: '', // Will be updated on first login
      email: userData.email,
      displayName: userData.displayName,
      role: 'FuneralDirector',
      funeralHomeName: userData.funeralHomeName,
      funeralHomeAddress: userData.funeralHomeAddress,
      funeralHomeEmail: userData.funeralHomeEmail,
      funeralHomePhone: userData.funeralHomePhone,
      personalPhone: userData.personalPhone,
      approved: false, // Requires admin approval
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId, isAuthenticated: false } as AuthUser;
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Admin functions
  async approveFuneralDirector(userId: ObjectId): Promise<void> {
    if (!this.isAdmin()) {
      throw new Error('Insufficient permissions');
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          approved: true,
          approvedAt: new Date(),
          approvedBy: this.currentUser?._id,
          updatedAt: new Date()
        }
      }
    );
  }

  async getPendingFuneralDirectors(): Promise<AuthUser[]> {
    if (!this.isAdmin()) {
      throw new Error('Insufficient permissions');
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    return await usersCollection.find({
      role: 'FuneralDirector',
      approved: false
    }).toArray() as AuthUser[];
  }

  // Profile management
  async updateProfile(updates: {
    displayName?: string;
    phone?: string;
  }): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { _id: this.currentUser._id },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    // Update current user cache
    if (this.currentUser) {
      Object.assign(this.currentUser, updates);
      this.user.set(this.currentUser);
    }
  }
}

// Singleton instance
export const authService = new AuthService();
