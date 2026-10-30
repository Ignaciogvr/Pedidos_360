import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { PermissionService } from '@core/services/permission.service';
import { UserStore } from '@core/stores/user.store';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { RoleBadgeComponent } from '@shared/components/role-badge/role-badge.component';
import { TokenDisplayComponent } from '@shared/components/token-display/token-display.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    UserAvatarComponent,
    RoleBadgeComponent,
    TokenDisplayComponent
  ],
  template: `
    <div class="profile-page">

      <div class="page-header">
        <div>
          <h1 class="page-title">👤 Mi Perfil</h1>
          <p class="page-subtitle">Información de tu cuenta corporativa</p>
        </div>
      </div>

      <!-- Avatar + Info principal -->
      <div class="profile-hero glass-card">
        <div class="avatar-wrapper">
          <app-user-avatar [name]="userStore.userName()" [size]="'xl'" />
        </div>
        <div class="hero-info">
          <h2 class="hero-name">{{ userStore.userName() }}</h2>
          <p class="hero-email">{{ userStore.userEmail() }}</p>
          <div class="roles-list">
            <app-role-badge *ngFor="let role of userStore.userRoles()" [role]="role" />
            <span *ngIf="userStore.userRoles().length === 0" class="role-pill role-none">Sin rol asignado</span>
          </div>
        </div>
        <div class="hero-permisos">
          <h4>Permisos en el sistema</h4>
          <div class="permiso-row" *ngFor="let p of permisos()">
            <span class="permiso-icon">{{ p.tiene ? '✅' : '❌' }}</span>
            <span class="permiso-label" [class.tiene]="p.tiene">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <!-- Claims del Token -->
      <div class="glass-card claims-card">
        <div class="claims-header">
          <h3 class="claims-title">🔑 Claims del Token JWT (Azure Entra ID)</h3>
          <span class="token-badge">ID Token</span>
        </div>
        <app-token-display [claims]="claims()" />
      </div>

      <!-- Info de la cuenta Azure -->
      <div class="glass-card azure-card">
        <h3 class="claims-title">☁️ Información de Azure Entra ID</h3>
        <div class="azure-grid">
          <div class="azure-item">
            <span class="azure-label">Tenant ID</span>
            <span class="azure-value mono">b6f34517-563c-4ce9-a10b-6f3958083091</span>
          </div>
          <div class="azure-item">
            <span class="azure-label">App Frontend Client ID</span>
            <span class="azure-value mono">6979a62f-803d-40d1-a7be-75ecd52f12a0</span>
          </div>
          <div class="azure-item">
            <span class="azure-label">App Backend Client ID</span>
            <span class="azure-value mono">3bdb2628-3745-4907-9593-53d8c7cb36fb</span>
          </div>
          <div class="azure-item">
            <span class="azure-label">Scope solicitado</span>
            <span class="azure-value mono">api://3bdb2628.../access_as_user</span>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button class="btn-danger-outline" (click)="logout()">🚪 Cerrar Sesión</button>
      </div>

    </div>
  `,
  styles: [`
    .profile-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { margin-bottom: 0.5rem; }
    .page-title { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.03em; color: #f1f5f9; }
    .page-subtitle { color: #94a3b8; font-size: 0.88rem; margin-top: 0.25rem; }

    /* Hero card */
    .profile-hero { display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; }
    .avatar-wrapper { position: relative; flex-shrink: 0; }

    .hero-info { flex: 1; }
    .hero-name { font-size: 1.5rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.3rem; }
    .hero-email { color: #64748b; font-size: 0.9rem; margin-bottom: 0.8rem; }
    .roles-list { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .role-pill { padding: 0.25rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .role-none { background: rgba(100,116,139,0.2); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2); }

    .hero-permisos { min-width: 220px; }
    .hero-permisos h4 { font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.8rem; }
    .permiso-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; }
    .permiso-icon { font-size: 0.9rem; }
    .permiso-label { font-size: 0.84rem; color: #475569; }
    .permiso-label.tiene { color: #94a3b8; }

    /* Claims */
    .claims-card { }
    .claims-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
    .claims-title { font-size: 1rem; font-weight: 700; color: #c4b5fd; }
    .token-badge { background: rgba(99,102,241,0.2); color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); padding: 0.2rem 0.7rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }

    /* Azure info */
    .azure-card { }
    .azure-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem; margin-top: 1rem; }
    .azure-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.8rem 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
    .azure-label { font-size: 0.73rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .azure-value { font-size: 0.82rem; color: #94a3b8; }
    .mono { font-family: monospace; word-break: break-all; }

    /* Acciones */
    .profile-actions { display: flex; justify-content: flex-end; }
    .btn-danger-outline { background: transparent; color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 0.55rem 1.4rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-danger-outline:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.5); }

    /* Glass card base */
    :host ::ng-deep .glass-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.5rem; }
  `]
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private permissionService = inject(PermissionService);
  readonly userStore = inject(UserStore);

  // Computed claims from TokenService
  claims = computed(() => this.tokenService.getFormattedClaims());

  // Computed permissions from PermissionService
  permisos = computed(() => [
    { label: 'Ver todos los pedidos', tiene: this.permissionService.canViewAllOrders() },
    { label: 'Crear pedidos', tiene: this.permissionService.canCreateOrders() },
    { label: 'Cambiar estado de pedidos', tiene: this.permissionService.canUpdateOrderStatus() },
    { label: 'Dejar comentarios', tiene: this.permissionService.canLeaveComments() },
    { label: 'Eliminar/Cancelar pedidos', tiene: this.permissionService.canDeleteOrders() },
    { label: 'Gestionar catálogo', tiene: this.permissionService.canManageCatalog() },
  ]);

  logout() {
    this.authService.logout();
  }
}