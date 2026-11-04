import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { PermissionService } from '@core/services/permission.service';
import { UserStore } from '@core/stores/user.store';
import { TokenDisplayComponent } from '@shared/components/token-display/token-display.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TokenDisplayComponent],
  template: `
    <div class="profile-page">

      <!-- HERO BANNER -->
      <div class="hero-banner">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="avatar-ring">
            <div class="avatar-circle" [ngClass]="avatarClass()">
              {{ initials() }}
            </div>
            <div class="avatar-glow" [ngClass]="glowClass()"></div>
          </div>
          <div class="hero-info">
            <h1 class="hero-name">{{ userStore.userName() }}</h1>
            <p class="hero-email">📧 {{ userStore.userEmail() }}</p>
            <div class="role-badges">
              <span *ngFor="let role of userStore.userRoles()" class="role-badge" [ngClass]="getRoleClass(role)">
                {{ getRoleIcon(role) }} {{ role }}
              </span>
              <span *ngIf="userStore.userRoles().length === 0" class="role-badge role-none">Sin rol</span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">🚪 Cerrar Sesión</button>
        </div>
      </div>

      <!-- PERMISOS -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-icon">🛡️</span>
          <div>
            <h2 class="section-title">Permisos del Sistema</h2>
            <p class="section-sub">Accesos según tu rol en Pedidos360</p>
          </div>
        </div>
        <div class="permisos-grid">
          <div class="permiso-card" *ngFor="let p of permisosDetalle()" [class.permiso-off]="!p.tiene">
            <div class="permiso-top">
              <span class="permiso-emoji">{{ p.icon }}</span>
              <span class="permiso-status" [class.status-on]="p.tiene" [class.status-off]="!p.tiene">
                {{ p.tiene ? '✅ Habilitado' : '❌ Sin acceso' }}
              </span>
            </div>
            <span class="permiso-nombre">{{ p.label }}</span>
            <span class="permiso-desc">{{ p.desc }}</span>
          </div>
        </div>
      </div>

      <!-- JWT CLAIMS (para el profe) -->
      <div class="section-card jwt-card">
        <div class="jwt-header" (click)="toggleJwt()">
          <div class="section-header" style="margin:0">
            <span class="section-icon">🔑</span>
            <div>
              <h2 class="section-title">Claims del Token JWT</h2>
              <p class="section-sub">Azure Entra ID · ID Token</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span class="token-badge">ID Token</span>
            <span class="toggle-arrow" [class.open]="jwtVisible()">▼</span>
          </div>
        </div>
        <div class="jwt-body" *ngIf="jwtVisible()">
          <app-token-display [claims]="claims()" />
        </div>
      </div>

      <!-- AZURE INFO (para el profe) -->
      <div class="section-card azure-card">
        <div class="section-header">
          <span class="section-icon">☁️</span>
          <div>
            <h2 class="section-title">Configuración Azure Entra ID</h2>
            <p class="section-sub">Identidades y aplicaciones registradas</p>
          </div>
        </div>
        <div class="azure-grid">
          <div class="azure-item">
            <span class="azure-label">🏢 Tenant ID</span>
            <span class="azure-value">b6f34517-563c-4ce9-a10b-6f3958083091</span>
          </div>
          <div class="azure-item">
            <span class="azure-label">🌐 Frontend Client ID</span>
            <span class="azure-value">6979a62f-803d-40d1-a7be-75ecd52f12a0</span>
          </div>
          <div class="azure-item">
            <span class="azure-label">⚙️ Backend Client ID</span>
            <span class="azure-value">3bdb2628-3745-4907-9593-53d8c7cb36fb</span>
          </div>
          <div class="azure-item">
            <span class="azure-label">🔐 Scope</span>
            <span class="azure-value">api://3bdb2628.../access_as_user</span>
          </div>
        </div>
      </div>

    </div>
  `,
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private permissionService = inject(PermissionService);
  readonly userStore = inject(UserStore);

  jwtVisible = signal(false);
  toggleJwt() { this.jwtVisible.update(v => !v); }

  claims = computed(() => this.tokenService.getFormattedClaims());

  initials = computed(() => {
    const name = this.userStore.userName() || '';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  });

  avatarClass = computed(() => {
    const role = (this.userStore.userRoles()[0] || '').toUpperCase();
    if (role.includes('ADMIN')) return 'avatar-admin';
    if (role.includes('OPERADOR') || role.includes('OPERATOR')) return 'avatar-oper';
    return 'avatar-client';
  });

  glowClass = computed(() => {
    const role = (this.userStore.userRoles()[0] || '').toUpperCase();
    if (role.includes('ADMIN')) return 'glow-admin';
    if (role.includes('OPERADOR') || role.includes('OPERATOR')) return 'glow-oper';
    return 'glow-client';
  });

  getRoleClass(role: string): string {
    const r = role.toUpperCase();
    if (r.includes('ADMIN')) return 'badge-admin';
    if (r.includes('OPERADOR') || r.includes('OPERATOR')) return 'badge-oper';
    return 'badge-client';
  }

  getRoleIcon(role: string): string {
    const r = role.toUpperCase();
    if (r.includes('ADMIN')) return '👑';
    if (r.includes('OPERADOR') || r.includes('OPERATOR')) return '⚙️';
    return '🛍️';
  }

  permisosDetalle = computed(() => [
    { label: 'Ver todos los pedidos', desc: 'Acceso a la lista completa de pedidos del sistema', icon: '👁️', tiene: this.permissionService.canViewAllOrders() },
    { label: 'Crear pedidos', desc: 'Puede generar nuevos pedidos en el catálogo', icon: '➕', tiene: this.permissionService.canCreateOrders() },
    { label: 'Cambiar estado', desc: 'Modifica el estado de pedidos (Pendiente → Completado)', icon: '🔄', tiene: this.permissionService.canUpdateOrderStatus() },
    { label: 'Dejar comentarios', desc: 'Agrega notas administrativas a los pedidos', icon: '💬', tiene: this.permissionService.canLeaveComments() },
    { label: 'Eliminar/Cancelar', desc: 'Puede cancelar o eliminar pedidos del sistema', icon: '🗑️', tiene: this.permissionService.canDeleteOrders() },
    { label: 'Gestionar catálogo', desc: 'Crea, edita y elimina productos del catálogo', icon: '📦', tiene: this.permissionService.canManageCatalog() },
  ]);

  logout() { this.authService.logout(); }
}