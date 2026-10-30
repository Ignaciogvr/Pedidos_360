/**
 * Permission Service
 * 
 * Centralized role-based access control.
 * All permission checks go through this service.
 */

import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private authService = inject(AuthService);
  
  // Computed signals for reactive permissions
  canDeleteOrder$ = computed(() => this.hasRole('Admin'));
  canUpdateOrderStatus$ = computed(() => 
    this.hasRole('Admin') || this.hasRole('Operador')
  );
  canViewAllOrders$ = computed(() => 
    this.hasRole('Admin') || this.hasRole('Operador')
  );
  canAccessAdminFeatures$ = computed(() => this.hasRole('Admin'));
  
  hasRole(roleName: string): boolean {
    const roles = this.authService.getUserRoles();
    return roles.includes(roleName);
  }
  
  hasAnyRole(roleNames: string[]): boolean {
    const userRoles = this.authService.getUserRoles();
    return roleNames.some(role => userRoles.includes(role));
  }
  
  hasAllRoles(roleNames: string[]): boolean {
    const userRoles = this.authService.getUserRoles();
    return roleNames.every(role => userRoles.includes(role));
  }
  
  canDeleteOrder(): boolean {
    return this.hasRole('Admin');
  }
  
  canUpdateOrderStatus(): boolean {
    return this.hasRole('Admin') || this.hasRole('Operador');
  }
  
  canViewAllOrders(): boolean {
    return this.hasRole('Admin') || this.hasRole('Operador');
  }
  
  canAccessAdminFeatures(): boolean {
    return this.hasRole('Admin');
  }  
  /**
   * Check if user can manage the product catalog
   */
  canManageCatalog(): boolean {
    return this.hasAnyRole(['Admin', 'Operador']);
  }
  
  /**
   * Check if user can create new orders
   */
  canCreateOrders(): boolean {
    return this.hasAnyRole(['Admin', 'Operador', 'Cliente']);
  }
  
  /**
   * Check if user can leave comments on orders
   */
  canLeaveComments(): boolean {
    return this.hasAnyRole(['Admin', 'Operador']);
  }
  
  /**
   * Alias for canDeleteOrder (for backwards compatibility)
   */
  canDeleteOrders(): boolean {
    return this.canDeleteOrder();
  }

}
