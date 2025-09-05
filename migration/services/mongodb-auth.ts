/**
 * MongoDB Authentication Service
 * Replaces Firebase Auth with Auth0 + MongoDB integration
 */

import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js';
import { connectToDatabase } from '../mongodb/connection';
import type { User } from '../schemas/mongodb-schemas';
import { ObjectId } from 'mongodb';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  roles: string[];
  isAuthenticated: boolean;
  mongoUser?: User;
}

export class MongoDBAuthService {
  private auth0Client: Auth0Client | null = null;
  private currentUser: AuthUser | null = null;

  async initialize() {
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
  }

  async login(email?: string, password?: string) {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');

    if (email && password) {
      // Direct login (for migration scenarios)
      await this.auth0Client.loginWithRedirect({
        authorizationParams: {
          login_hint: email
        }
      });
    } else {
      // Standard Auth0 Universal Login
      await this.auth0Client.loginWithRedirect();
    }
  }

  async logout() {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');

    await this.auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
    
    this.currentUser = null;
  }

  async handleCallback() {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');

    await this.auth0Client.handleRedirectCallback();
    await this.loadCurrentUser();
  }

  async loadCurrentUser(): Promise<AuthUser | null> {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');

    try {
      const auth0User = await this.auth0Client.getUser();
      if (!auth0User) return null;

      const token = await this.auth0Client.getTokenSilently();
      const roles = this.extractRoles(token);

      // Load or create MongoDB user record
      const mongoUser = await this.getOrCreateMongoUser(auth0User);

      this.currentUser = {
        id: auth0User.sub!,
        email: auth0User.email!,
        name: auth0User.name,
        picture: auth0User.picture,
        roles,
        isAuthenticated: true,
        mongoUser
      };

      return this.currentUser;
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  }

  private extractRoles(token: string): string[] {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['https://tributestream.com/roles'] || [];
    } catch (error) {
      console.error('Error extracting roles from token:', error);
      return [];
    }
  }

  private async getOrCreateMongoUser(auth0User: any): Promise<User> {
    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Try to find existing user
    let mongoUser = await usersCollection.findOne({ auth0Id: auth0User.sub });

    if (!mongoUser) {
      // Create new user record
      const newUser: Omit<User, '_id'> = {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        displayName: auth0User.name,
        role: 'Viewer', // Default role
        emailVerified: auth0User.email_verified || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await usersCollection.insertOne(newUser as User);
      mongoUser = { ...newUser, _id: result.insertedId } as User;
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

    return mongoUser;
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

  hasRole(role: string): boolean {
    return this.currentUser?.roles.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
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
    return this.isFuneralDirector() && 
           this.currentUser?.mongoUser?.approved === true;
  }

  // User registration for memorial creation
  async registerMemorialOwner(userData: {
    email: string;
    displayName: string;
    phone: string;
  }): Promise<{ user: User; tempPassword: string }> {
    // This would typically be handled by a backend API
    // For now, we'll create the user record and let Auth0 handle the auth
    
    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const tempPassword = this.generateTempPassword();
    
    // Create user in MongoDB (Auth0 user will be created on first login)
    const newUser: Omit<User, '_id'> = {
      auth0Id: '', // Will be updated on first login
      email: userData.email,
      displayName: userData.displayName,
      phone: userData.phone,
      role: 'Owner',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser as User);
    const user = { ...newUser, _id: result.insertedId } as User;

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
  }): Promise<User> {
    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const newUser: Omit<User, '_id'> = {
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

    const result = await usersCollection.insertOne(newUser as User);
    return { ...newUser, _id: result.insertedId } as User;
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
    const usersCollection = db.collection<User>('users');

    await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          approved: true,
          approvedAt: new Date(),
          approvedBy: this.currentUser?.mongoUser?._id,
          updatedAt: new Date()
        }
      }
    );
  }

  async getPendingFuneralDirectors(): Promise<User[]> {
    if (!this.isAdmin()) {
      throw new Error('Insufficient permissions');
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    return await usersCollection.find({
      role: 'FuneralDirector',
      approved: false
    }).toArray();
  }

  // Profile management
  async updateProfile(updates: {
    displayName?: string;
    phone?: string;
  }): Promise<void> {
    if (!this.currentUser?.mongoUser) {
      throw new Error('User not authenticated');
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    await usersCollection.updateOne(
      { _id: this.currentUser.mongoUser._id },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    // Update current user cache
    if (this.currentUser.mongoUser) {
      Object.assign(this.currentUser.mongoUser, updates);
    }
  }
}

// Singleton instance
export const authService = new MongoDBAuthService();
