import { Injectable, inject, signal, computed } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';
import { UserData } from '../../shared/models/user.model';

/**
 * AuthService - Centralized MSAL authentication wrapper
 * 
 * Components should NEVER access MsalService directly.
 * All authentication operations go through this service.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private msalService = inject(MsalService);
  
  // Writable signal for reactive user data (private to prevent external mutations)
  private userSignal = signal<UserData | null>(null);
  
  // Public readonly signals
  user$ = this.userSignal.asReadonly();
  isAuthenticated$ = computed(() => this.userSignal() !== null);
  
  constructor() {
    // Initialize user data from active MSAL account
    this.loadUserFromMsal();
  }
  
  /**
   * Get current user data synchronously
   */
  getCurrentUser(): UserData | null {
    return this.userSignal();
  }
  
  /**
   * Get authenticated user email
   */
  getUserEmail(): string {
    return this.userSignal()?.email || '';
  }
  
  /**
   * Get authenticated user full name
   */
  getUserName(): string {
    return this.userSignal()?.name || '';
  }
  
  /**
   * Get user roles array
   */
  getUserRoles(): string[] {
    return this.userSignal()?.roles || [];
  }
  
  /**
   * Get user initials (two uppercase characters)
   */
  getUserInitials(): string {
    return this.userSignal()?.initials || '??';
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }
  
  /**
   * Redirect to Microsoft login page
   */
  login(): void {
    this.msalService.loginRedirect();
  }
  
  /**
   * Redirect to Microsoft logout page
   */
  logout(): void {
    this.msalService.logoutRedirect();
  }
  
  /**
   * Refresh user data from MSAL
   * Called by app component after MSAL redirect callback
   */
  refreshUser(): void {
    this.loadUserFromMsal();
  }
  
  /**
   * Load user data from MSAL active account
   * @private
   */
  private loadUserFromMsal(): void {
    try {
      let activeAccount = this.msalService.instance.getActiveAccount();
      
      // If no active account, try to get first available account
      if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
        activeAccount = this.msalService.instance.getAllAccounts()[0];
        this.msalService.instance.setActiveAccount(activeAccount);
      }
      
      if (activeAccount) {
        const userData = this.extractUserData(activeAccount);
        this.userSignal.set(userData);
      } else {
        this.userSignal.set(null);
      }
    } catch (error) {
      console.error('[AuthService] Error loading user from MSAL:', error);
      this.userSignal.set(null);
    }
  }
  
  /**
   * Extract UserData from MSAL AccountInfo
   * @private
   */
  private extractUserData(account: AccountInfo): UserData {
    const claims = account.idTokenClaims as any;
    const roles = (claims?.roles as string[]) || [];
    const name = account.name || '';
    const email = account.username || '';
    
    return {
      name,
      email,
      roles,
      initials: this.calculateInitials(name),
      oid: claims?.oid,
      tid: claims?.tid
    };
  }
  
  /**
   * Calculate two-character initials from full name
   * 
   * Logic:
   * - Empty/whitespace name → '??'
   * - Single word → first 2 chars uppercase (e.g., 'John' → 'JO')
   * - Multiple words → first char of first word + first char of last word uppercase (e.g., 'John Doe' → 'JD')
   * 
   * @private
   */
  private calculateInitials(name: string): string {
    const trimmed = name.trim();
    
    // Handle empty name
    if (!trimmed) {
      return '??';
    }
    
    // Split into words (handles multiple spaces)
    const words = trimmed.split(/\s+/);
    
    // Single word: take first 2 characters
    if (words.length === 1) {
      const word = words[0];
      if (word.length >= 2) {
        return word.substring(0, 2).toUpperCase();
      }
      // Single character name: duplicate it
      return (word[0] + word[0]).toUpperCase();
    }
    
    // Multiple words: first char of first word + first char of last word
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    return (firstWord[0] + lastWord[0]).toUpperCase();
  }
}
