import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserData } from '../../shared/models/user.model';
import { UsuarioService } from '../../services/usuario.service';

/**
 * UserState interface defining the complete state shape
 */
export interface UserState {
  currentUser: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * UserStore - Reactive user state management using Angular Signals
 * 
 * Purpose: Centralized reactive user state accessible from any component without prop drilling.
 * Components should use this store to access current user data, roles, and authentication state.
 * 
 * The store wraps AuthService and provides computed role signals for convenient access.
 */
@Injectable({ providedIn: 'root' })
export class UserStore {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  
  // Private writable signals (prevent external mutations)
  private userSignal = signal<UserData | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  
  // Public readonly signals
  readonly currentUser = this.userSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  
  // Computed signals derived from user data
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  
  readonly isAdmin = computed(() => 
    this.userSignal()?.roles.includes('Admin') || this.userSignal()?.roles.includes('ADMIN') || false
  );
  
  readonly isOperador = computed(() => 
    this.userSignal()?.roles.includes('Operador') || this.userSignal()?.roles.includes('OPERADOR') || false
  );
  
  readonly isCliente = computed(() => 
    this.userSignal()?.roles.includes('Cliente') || this.userSignal()?.roles.includes('CLIENTE') || false
  );
  
    
  /**
   * User initials for display in avatar
   */
  readonly userInitials = computed(() => {
    const user = this.userSignal();
    if (!user?.name) return '??';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  });
  
  /**
   * User display name
   */
  readonly userName = computed(() => this.userSignal()?.name || 'Usuario');
  
  /**
   * User email address
   */
  readonly userEmail = computed(() => this.userSignal()?.email || '');
  
  /**
   * User roles array
   */
  readonly userRoles = computed(() => this.userSignal()?.roles || []);
  
  constructor() {
    // Initialize user data from AuthService on store instantiation
    this.loadUser();
  }
  
  /**
   * Load user data from AuthService and auto-register in backend
   * Updates the currentUser signal with data from the authentication service
   */
  loadUser(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const user = this.authService.getCurrentUser();
      this.userSignal.set(user);
      
      // Auto-register user in backend if authenticated
      if (user && user.email && user.name) {
        this.autoRegister(user.email, user.name, user.roles?.[0]);
      }
    } catch (error) {
      console.error('[UserStore] Load error:', error);
      this.errorSignal.set('Error al cargar usuario');
    } finally {
      this.loadingSignal.set(false);
    }
  }
  
  /**
   * Auto-register user in MySQL after Azure AD login
   * Backend will create or verify user keeping their highest role
   */
  private autoRegister(email: string, nombre: string, azureRole?: string): void {
    this.usuarioService.registrar(email, nombre, azureRole).subscribe({
      next: (usuarioBackend) => {
        console.log('[UserStore] Usuario registrado/verificado:', usuarioBackend);
        const currentUser = this.userSignal();
        if (currentUser) {
          const rolMapping: { [key: string]: string } = {
            'ADMIN': 'Admin',
            'OPERADOR': 'Operador',
            'CLIENTE': 'Cliente'
          };
          const backendRole = usuarioBackend.rol ? (rolMapping[usuarioBackend.rol] || usuarioBackend.rol) : undefined;
          
          // Azure AD es la autoridad principal para los roles
          let finalRoles = currentUser.roles && currentUser.roles.length > 0 ? [...currentUser.roles] : [];
          
          // Si Azure AD no trajo rol o el backend tiene Admin, sincronizar
          if (finalRoles.length === 0 && backendRole) {
            finalRoles = [backendRole];
          } else if (backendRole === 'Admin' && !finalRoles.includes('Admin')) {
            finalRoles = ['Admin'];
          }

          this.userSignal.set({
            ...currentUser,
            roles: finalRoles
          });
          
          // Store in localStorage for persistence
          localStorage.setItem('currentUser', JSON.stringify({
            email: usuarioBackend.email,
            nombre: usuarioBackend.nombre,
            rol: finalRoles[0] || usuarioBackend.rol,
            activo: usuarioBackend.activo
          }));
        }
      },
      error: (error) => {
        console.error('[UserStore] Error auto-registro:', error);
        // Non-blocking error, user can still use the app with Azure AD data
      }
    });
  }
  
  /**
   * Clear user state on logout
   * Resets all signals to their initial empty state
   */
  clearUser(): void {
    this.userSignal.set(null);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
    localStorage.removeItem('currentUser');
  }
}
