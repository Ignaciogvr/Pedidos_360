import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { PedidoService } from '../services/pedido.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
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
          <div class="avatar-big">{{ iniciales() }}</div>
          <div class="avatar-glow"></div>
        </div>
        <div class="hero-info">
          <h2 class="hero-name">{{ nombre() }}</h2>
          <p class="hero-email">{{ email() }}</p>
          <div class="roles-list">
            <span *ngFor="let r of roles()" class="role-pill" [ngClass]="'role-' + r">{{ r }}</span>
            <span *ngIf="roles().length === 0" class="role-pill role-none">Sin rol asignado</span>
          </div>
        </div>
        <div class="hero-permisos">
          <h4>Permisos en el sistema</h4>
          <div class="permiso-row" *ngFor="let p of permisos()">
            <span class="permiso-icon">{{ p.tiene ? '✅' : '🚫' }}</span>
            <span class="permiso-label" [class.tiene]="p.tiene">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <!-- Claims del Token -->
      <div class="glass-card claims-card">
        <div class="claims-header">
          <h3 class="claims-title">🔐 Claims del Token JWT (Azure Entra ID)</h3>
          <span class="token-badge">ID Token</span>
        </div>
        <div class="claims-grid">
          <div class="claim-row" *ngFor="let c of claims()">
            <span class="claim-key">{{ c.key }}</span>
            <span class="claim-value">{{ c.value }}</span>
          </div>
        </div>
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
    .avatar-big { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a78bfa); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 800; color: white; position: relative; z-index: 1; }
    .avatar-glow { position: absolute; inset: -6px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a78bfa); opacity: 0.3; filter: blur(12px); }

    .hero-info { flex: 1; }
    .hero-name { font-size: 1.5rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.3rem; }
    .hero-email { color: #64748b; font-size: 0.9rem; margin-bottom: 0.8rem; }
    .roles-list { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .role-pill { padding: 0.25rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .role-Admin { background: rgba(99,102,241,0.2); color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); }
    .role-Operador { background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(147,197,253,0.3); }
    .role-Cliente { background: rgba(16,185,129,0.2); color: #6ee7b7; border: 1px solid rgba(110,231,183,0.3); }
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
    .claims-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.5rem; }
    .claim-row { display: flex; gap: 0.75rem; align-items: flex-start; background: rgba(255,255,255,0.03); padding: 0.6rem 0.9rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
    .claim-key { font-size: 0.78rem; font-weight: 700; color: #6366f1; min-width: 130px; flex-shrink: 0; font-family: monospace; }
    .claim-value { font-size: 0.8rem; color: #94a3b8; word-break: break-all; font-family: monospace; }

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
  private msalService = inject(MsalService);
  private pedidoService = inject(PedidoService);

  nombre = signal('');
  email = signal('');
  roles = signal<string[]>([]);
  iniciales = signal('?');
  claims = signal<{ key: string, value: string }[]>([]);
  permisos = signal<{ label: string, tiene: boolean }[]>([]);

  constructor() {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) return;

    const nombre = account.name || '';
    const email = account.username || '';
    const roles = (account.idTokenClaims?.['roles'] as string[]) || [];

    this.nombre.set(nombre);
    this.email.set(email);
    this.roles.set(roles);
    this.iniciales.set(nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());

    // Permisos según rol
    const isAdmin = roles.includes('Admin');
    const isOp = roles.includes('Operador');
    const isCli = roles.includes('Cliente');
    this.permisos.set([
      { label: 'Ver todos los pedidos', tiene: isAdmin || isOp },
      { label: 'Crear pedidos', tiene: isAdmin || isCli },
      { label: 'Cambiar estado de pedidos', tiene: isAdmin || isOp },
      { label: 'Dejar comentarios', tiene: isAdmin || isOp },
      { label: 'Eliminar/Cancelar pedidos', tiene: isAdmin },
      { label: 'Gestionar catálogo', tiene: isAdmin },
    ]);

    // Claims del token
    const c = account.idTokenClaims as Record<string, unknown>;
    const keys = ['name', 'preferred_username', 'roles', 'oid', 'tid', 'iss', 'aud', 'exp', 'iat', 'ver'];
    this.claims.set(keys.filter(k => c[k] !== undefined).map(k => ({
      key: k,
      value: Array.isArray(c[k]) ? (c[k] as string[]).join(', ') : String(c[k])
    })));
  }

  logout() { this.msalService.logoutRedirect(); }
}
