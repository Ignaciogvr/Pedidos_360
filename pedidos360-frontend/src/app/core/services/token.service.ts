/**
 * Token Service
 * 
 * Extracts and formats JWT claims for debugging and display.
 * Not used for business logic - use AuthService/PermissionService instead.
 */

import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

export interface TokenClaim {
  key: string;
  value: string;
  category?: 'identity' | 'auth' | 'time' | 'other';
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private msalService = inject(MsalService);
  
  private readonly IMPORTANT_CLAIMS = [
    'name',
    'preferred_username', 
    'roles',
    'oid',
    'tid',
    'iss',
    'aud',
    'exp',
    'iat',
    'nbf'
  ];
  
  private readonly TIME_CLAIMS = ['exp', 'iat', 'nbf'];
  
  getAllClaims(): TokenClaim[] {
    const account = this.msalService.instance.getActiveAccount();
    if (!account?.idTokenClaims) return [];
    
    const claims = account.idTokenClaims as Record<string, any>;
    return Object.entries(claims).map(([key, value]) => ({
      key,
      value: this.formatClaimValue(value),
      category: this.categorize(key)
    }));
  }
  
  getImportantClaims(): TokenClaim[] {
    const allClaims = this.getAllClaims();
    return allClaims.filter(c => this.IMPORTANT_CLAIMS.includes(c.key));
  }
  
  getClaimValue(key: string): string | null {
    const account = this.msalService.instance.getActiveAccount();
    if (!account?.idTokenClaims) return null;
    
    const claims = account.idTokenClaims as Record<string, any>;
    const value = claims[key];
    return value !== undefined ? this.formatClaimValue(value) : null;
  }
  
  formatClaimValue(value: any): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'number' && this.looksLikeTimestamp(value)) {
      return this.formatTimestamp(value);
    }
    return String(value);
  }
  
  private looksLikeTimestamp(num: number): boolean {
    return num > 1000000000 && num < 9999999999;
  }
  
  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  private categorize(key: string): TokenClaim['category'] {
    if (['name', 'preferred_username', 'email', 'oid'].includes(key)) {
      return 'identity';
    }
    if (['roles', 'scp', 'groups'].includes(key)) {
      return 'auth';
    }
    if (this.TIME_CLAIMS.includes(key)) {
      return 'time';
    }
    return 'other';
  }  
  /**
   * Get formatted claims for display in UI
   * Returns important claims with formatted values
   */
  getFormattedClaims(): TokenClaim[] {
    return this.getImportantClaims();
  }

}
