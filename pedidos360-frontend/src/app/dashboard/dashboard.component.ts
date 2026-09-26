import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, Pedido } from '../services/pedido.service';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="dash-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">📊 Panel de Control</h1>
          <p class="page-subtitle">Resumen en tiempo real del sistema Pedidos360</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" *ngIf="!cargando()">
        <div class="stat-card stat-total">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <span class="stat-label">Total Pedidos</span>
            <span class="stat-number">{{ stats().total }}</span>
          </div>
        </div>
        <div class="stat-card stat-pendiente">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <span class="stat-label">Pendientes</span>
            <span class="stat-number">{{ stats().pendientes }}</span>
          </div>
        </div>
        <div class="stat-card stat-proceso">
          <div class="stat-icon">🔄</div>
          <div class="stat-info">
            <span class="stat-label">En Proceso</span>
            <span class="stat-number">{{ stats().enProceso }}</span>
          </div>
        </div>
        <div class="stat-card stat-completado">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-label">Completados</span>
            <span class="stat-number">{{ stats().completados }}</span>
          </div>
        </div>
      </div>

      <!-- Token Info Card (para mostrar al profe) -->
      <div class="glass-card token-card" *ngIf="tokenInfo()">
        <div class="token-header">
          <h3 class="token-title">🔐 Claims del Token JWT (Azure)</h3>
          <span class="token-badge">ID Token</span>
        </div>
        <div class="token-grid">
          <div class="token-row" *ngFor="let item of tokenInfo()">
            <span class="token-key">{{ item.key }}</span>
            <span class="token-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-page { display: flex; flex-direction: column; gap: 1.5rem; }

    .page-header { margin-bottom: 0.5rem; }
    .page-title { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.03em; color: #f1f5f9; }
    .page-subtitle { color: #94a3b8; font-size: 0.88rem; margin-top: 0.25rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }

    .stat-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.2rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.3); }

    .stat-icon { font-size: 2.2rem; }

    .stat-info { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.25rem; }
    .stat-number { font-size: 2.5rem; font-weight: 800; line-height: 1; letter-spacing: -0.03em; }

    .stat-total { border-color: rgba(99,102,241,0.25); background: rgba(99,102,241,0.08); }
    .stat-total .stat-number { color: #818cf8; }

    .stat-pendiente { border-color: rgba(245,158,11,0.25); background: rgba(245,158,11,0.07); }
    .stat-pendiente .stat-number { color: #fbbf24; }

    .stat-proceso { border-color: rgba(59,130,246,0.25); background: rgba(59,130,246,0.07); }
    .stat-proceso .stat-number { color: #60a5fa; }

    .stat-completado { border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.07); }
    .stat-completado .stat-number { color: #34d399; }

    /* Token Info */
    .token-card { }
    .token-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
    .token-title { font-size: 1rem; font-weight: 700; color: #c4b5fd; }
    .token-badge { background: rgba(99,102,241,0.2); color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); padding: 0.2rem 0.7rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }

    .token-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0.5rem; }
    .token-row { display: flex; gap: 0.75rem; align-items: flex-start; background: rgba(255,255,255,0.03); padding: 0.6rem 0.9rem; border-radius: 8px; }
    .token-key { font-size: 0.78rem; font-weight: 700; color: #6366f1; min-width: 120px; flex-shrink: 0; font-family: monospace; }
    .token-value { font-size: 0.82rem; color: #94a3b8; word-break: break-all; font-family: monospace; }
  `]
})
export class DashboardComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private msalService = inject(MsalService);

  cargando = signal(true);
  stats = signal({ total: 0, pendientes: 0, enProceso: 0, completados: 0 });
  tokenInfo = signal<{ key: string, value: string }[]>([]);

  ngOnInit() {
    this.cargarStats();
    this.cargarTokenInfo();
  }

  cargarStats() {
    this.pedidoService.getPedidos().subscribe({
      next: (pedidos) => {
        this.stats.set({
          total: pedidos.length,
          pendientes: pedidos.filter(p => p.estado === 'PENDIENTE').length,
          enProceso: pedidos.filter(p => p.estado === 'EN_PROCESO').length,
          completados: pedidos.filter(p => p.estado === 'COMPLETADO').length,
        });
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  cargarTokenInfo() {
    const account = this.msalService.instance.getActiveAccount();
    if (!account?.idTokenClaims) return;

    const claims = account.idTokenClaims as Record<string, unknown>;
    const clavesMostrar = ['name', 'preferred_username', 'roles', 'oid', 'tid', 'iss', 'aud', 'exp'];

    const info: { key: string, value: string }[] = [];

    for (const key of clavesMostrar) {
      if (claims[key] !== undefined) {
        const val = claims[key];
        info.push({
          key,
          value: Array.isArray(val) ? (val as string[]).join(', ') : String(val)
        });
      }
    }

    this.tokenInfo.set(info);
  }
}
