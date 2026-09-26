import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, Pedido } from '../services/pedido.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
  <div class="orders-page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ esAdminUOperador ? '📦 Gestión de Pedidos' : '🛒 Mis Pedidos' }}</h1>
        <p class="page-subtitle">{{ esAdminUOperador ? 'Vista completa del sistema' : 'Historial y estado de tus pedidos' }}</p>
      </div>
      <button class="btn-primary" (click)="cargarPedidos()">↻ Actualizar</button>
    </div>

    <!-- Error -->
    <div *ngIf="error()" class="alert-error">⚠ {{ error() }}</div>

    <!-- VISTA ADMIN/OPERADOR: Tabla con filtros -->
    <ng-container *ngIf="esAdminUOperador">
      <div class="glass-card filters-bar">
        <div class="filters-left">
          <span class="filter-label">Estado:</span>
          <button *ngFor="let f of filtrosEstado" class="filter-btn" [class.active]="filtroActivo() === f.value" (click)="setFiltro(f.value)">{{ f.label }}</button>
        </div>
        <div class="filters-right">
          <span class="filter-label">Cliente:</span>
          <input id="input-buscar" type="text" [(ngModel)]="busquedaCliente" placeholder="Email o nombre..." class="form-input form-input-sm" />
        </div>
      </div>

      <div *ngIf="cargando()" class="loading-wrapper"><div class="spinner"></div><span>Cargando...</span></div>

      <div class="glass-card table-card" *ngIf="!cargando()">
        <div class="table-responsive">
          <table class="orders-table">
            <thead><tr>
              <th>ID</th><th>Cliente</th><th>Producto</th><th>Cant.</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
            </tr></thead>
            <tbody>
              <tr *ngIf="pedidosFiltrados().length === 0"><td colspan="7" class="empty-row">No hay pedidos</td></tr>
              <tr *ngFor="let p of pedidosFiltrados()" class="table-row" (click)="abrirDetalle(p)" style="cursor:pointer">
                <td><span class="id-badge">#{{ p.id }}</span></td>
                <td class="client-cell">
                  <span class="client-name">{{ p.clienteNombre }}</span>
                  <span class="client-email">{{ p.clienteEmail }}</span>
                </td>
                <td class="product-cell">{{ p.producto }}</td>
                <td><span class="qty-badge">{{ p.cantidad }}</span></td>
                <td><span class="status-badge" [ngClass]="getEstadoClass(p.estado)">{{ p.estado }}</span></td>
                <td class="date-cell">{{ p.fechaCreacion | date:'dd/MM/yy HH:mm' }}</td>
                <td class="actions-cell" (click)="$event.stopPropagation()">
                  <button *ngIf="puedeCambiarEstado" class="btn-estado" (click)="abrirModalEstado(p)">✏ Estado</button>
                  <button *ngIf="puedeEliminar && p.estado !== 'CANCELADO'" class="btn-danger" (click)="cancelar(p.id!)">🚫 Cancelar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-footer"><span class="count-text">{{ pedidosFiltrados().length }} pedido(s)</span></div>
      </div>
    </ng-container>

    <!-- VISTA CLIENTE: Tarjetas con timeline -->
    <ng-container *ngIf="!esAdminUOperador">
      <div *ngIf="cargando()" class="loading-wrapper"><div class="spinner"></div><span>Cargando tus pedidos...</span></div>

      <div class="client-empty" *ngIf="!cargando() && pedidos().length === 0">
        <span>📭</span>
        <h3>No tienes pedidos aún</h3>
        <p>Ve al catálogo de Productos para hacer tu primer pedido</p>
      </div>

      <div class="client-orders-grid" *ngIf="!cargando() && pedidos().length > 0">
        <div class="order-card" *ngFor="let p of pedidos()" (click)="abrirDetalle(p)">
          <div class="order-card-header">
            <span class="id-badge">#{{ p.id }}</span>
            <span class="status-badge" [ngClass]="getEstadoClass(p.estado)">{{ p.estado }}</span>
          </div>
          <h3 class="order-product">{{ p.producto }}</h3>
          <p class="order-date">{{ p.fechaCreacion | date:'dd MMM yyyy, HH:mm' }}</p>

          <!-- Timeline de estados -->
          <div class="timeline">
            <div class="timeline-step" [class.done]="isEstadoAlcanzado(p.estado, 'PENDIENTE')" [class.active]="p.estado === 'PENDIENTE'">
              <div class="timeline-dot"></div>
              <span>Pendiente</span>
            </div>
            <div class="timeline-line" [class.done]="isEstadoAlcanzado(p.estado, 'EN_PROCESO')"></div>
            <div class="timeline-step" [class.done]="isEstadoAlcanzado(p.estado, 'EN_PROCESO')" [class.active]="p.estado === 'EN_PROCESO'">
              <div class="timeline-dot"></div>
              <span>En Proceso</span>
            </div>
            <div class="timeline-line" [class.done]="p.estado === 'COMPLETADO'"></div>
            <div class="timeline-step" [class.done]="p.estado === 'COMPLETADO'" [class.active]="p.estado === 'COMPLETADO'">
              <div class="timeline-dot"></div>
              <span>Completado</span>
            </div>
          </div>

          <!-- Comentario del admin si existe -->
          <div class="admin-comment" *ngIf="p.comentarioAdmin">
            <span class="comment-icon">💬</span>
            <span class="comment-text">{{ p.comentarioAdmin }}</span>
          </div>

          <div class="order-card-footer">
            <span class="order-qty">Cantidad: {{ p.cantidad }}</span>
            <span class="ver-detalle">Ver detalle →</span>
          </div>
        </div>
      </div>
    </ng-container>


    <!-- ====== MODAL DETALLE DEL PEDIDO ====== -->
    <div class="modal-overlay" *ngIf="modalDetalle()" (click)="modalDetalle.set(false)">
      <div class="modal modal-detalle" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📋 Detalle del Pedido <span class="modal-id">#{{ pedidoDetalle()?.id }}</span></h3>
          <button class="modal-close" (click)="modalDetalle.set(false)">✕</button>
        </div>

        <div class="detalle-grid" *ngIf="pedidoDetalle() as p">
          <!-- Info principal -->
          <div class="detalle-section">
            <h4 class="detalle-section-title">📦 Producto</h4>
            <div class="detalle-row"><span class="detalle-label">Producto</span><span class="detalle-value">{{ p.producto }}</span></div>
            <div class="detalle-row"><span class="detalle-label">Cantidad</span><span class="detalle-value">{{ p.cantidad }} unidad(es)</span></div>
            <div class="detalle-row"><span class="detalle-label">Estado actual</span><span class="status-badge" [ngClass]="getEstadoClass(p.estado)">{{ p.estado }}</span></div>
            <div class="detalle-row"><span class="detalle-label">Fecha de pedido</span><span class="detalle-value">{{ p.fechaCreacion | date:'dd/MM/yyyy HH:mm:ss' }}</span></div>
          </div>

          <!-- Info cliente -->
          <div class="detalle-section" *ngIf="p.clienteNombre">
            <h4 class="detalle-section-title">👤 Cliente</h4>
            <div class="detalle-row"><span class="detalle-label">Nombre</span><span class="detalle-value">{{ p.clienteNombre }}</span></div>
            <div class="detalle-row"><span class="detalle-label">Email</span><span class="detalle-value">{{ p.clienteEmail }}</span></div>
          </div>

          <!-- Timeline -->
          <div class="detalle-section">
            <h4 class="detalle-section-title">🚦 Progreso</h4>
            <div class="timeline timeline-vertical">
              <div class="tl-item" [class.done]="isEstadoAlcanzado(p.estado, 'PENDIENTE')">
                <div class="tl-dot">⏳</div>
                <div class="tl-content"><span class="tl-label">Pedido recibido</span><span class="tl-sub">Estado: PENDIENTE</span></div>
              </div>
              <div class="tl-item" [class.done]="isEstadoAlcanzado(p.estado, 'EN_PROCESO')">
                <div class="tl-dot">🔄</div>
                <div class="tl-content"><span class="tl-label">En preparación</span><span class="tl-sub">Estado: EN_PROCESO</span></div>
              </div>
              <div class="tl-item" [class.done]="p.estado === 'COMPLETADO'" *ngIf="p.estado !== 'CANCELADO'">
                <div class="tl-dot">✅</div>
                <div class="tl-content"><span class="tl-label">Entregado</span><span class="tl-sub">Estado: COMPLETADO</span></div>
              </div>
              <div class="tl-item done" *ngIf="p.estado === 'CANCELADO'">
                <div class="tl-dot" style="background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4);">🚫</div>
                <div class="tl-content"><span class="tl-label" style="color: #f87171;">Pedido Cancelado</span><span class="tl-sub">Estado: CANCELADO</span></div>
              </div>
            </div>
          </div>

          <!-- Comentario del Admin -->
          <div class="detalle-section" *ngIf="p.comentarioAdmin">
            <h4 class="detalle-section-title">💬 Mensaje del Administrador</h4>
            <div class="admin-comment-box">{{ p.comentarioAdmin }}</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-outline" (click)="modalDetalle.set(false)">Cerrar</button>
          <button *ngIf="puedeCambiarEstado" class="btn-primary" (click)="modalDetalle.set(false); abrirModalEstado(pedidoDetalle()!)">✏ Cambiar Estado</button>
        </div>
      </div>
    </div>


    <!-- ====== MODAL CAMBIAR ESTADO ====== -->
    <div class="modal-overlay" *ngIf="modalAbierto()" (click)="cerrarModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>✏ Estado del pedido <span class="modal-id">#{{ pedidoSeleccionado()?.id }}</span></h3>
          <button class="modal-close" (click)="cerrarModal()">✕</button>
        </div>
        <p class="modal-product">{{ pedidoSeleccionado()?.producto }}</p>
        <div class="estado-options">
          <button *ngFor="let e of estados" class="estado-option" [class.selected]="nuevoEstado() === e.value" (click)="nuevoEstado.set(e.value)">
            <span class="estado-icon">{{ e.icon }}</span><span>{{ e.label }}</span>
          </button>
        </div>
        <!-- Comentario Admin -->
        <div class="comentario-section">
          <label class="comentario-label">💬 Mensaje para el cliente (opcional)</label>
          <textarea id="admin-comentario" [(ngModel)]="comentarioAdmin" rows="3"
            placeholder="Ej: Tu pedido está siendo preparado, estará listo mañana..."
            class="form-input comentario-input"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" (click)="cerrarModal()">Cancelar</button>
          <button class="btn-primary" (click)="confirmarEstado()">Guardar cambio</button>
        </div>
      </div>
    </div>

  </div>
  `,
  styles: [`
    .orders-page { display: flex; flex-direction: column; gap: 1.25rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.03em; color: #f1f5f9; }
    .page-subtitle { color: #94a3b8; font-size: 0.88rem; margin-top: 0.25rem; }
    .alert-error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 0.8rem 1.2rem; border-radius: 10px; }

    .create-form { }
    .form-title { font-size: 1rem; font-weight: 700; color: #c4b5fd; margin-bottom: 1rem; }
    .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
    .form-input { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: #f1f5f9; padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.9rem; transition: border-color 0.2s; min-width: 200px; }
    .form-input::placeholder { color: #64748b; }
    .form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .form-input-sm { min-width: 90px; width: 90px; }

    /* Filtros */
    .filters-bar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; padding: 1rem 1.5rem; }
    .filters-left { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .filters-right { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
    .filter-label { font-size: 0.78rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .filter-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.3rem 0.9rem; border-radius: 20px; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-btn:hover { background: rgba(255,255,255,0.07); color: #f1f5f9; }
    .filter-btn.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.5); color: #a78bfa; font-weight: 700; }

    /* Tabla */
    .loading-wrapper { display: flex; align-items: center; gap: 1rem; color: #64748b; padding: 2rem; justify-content: center; }
    .spinner { width: 24px; height: 24px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .table-card { padding: 0; overflow: hidden; }
    .table-responsive { overflow-x: auto; }
    .orders-table { width: 100%; border-collapse: collapse; }
    .orders-table thead tr { background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.08); }
    .orders-table th { padding: 0.9rem 1rem; text-align: left; font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
    .orders-table td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .table-row { transition: background 0.15s; }
    .table-row:hover td { background: rgba(255,255,255,0.04); }
    .table-row:last-child td { border-bottom: none; }
    .id-badge { background: rgba(99,102,241,0.12); color: #a78bfa; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.82rem; font-weight: 700; }
    .client-cell { display: flex; flex-direction: column; gap: 0.1rem; }
    .client-name { font-weight: 600; font-size: 0.88rem; color: #f1f5f9; }
    .client-email { font-size: 0.73rem; color: #64748b; }
    .product-cell { font-weight: 500; color: #e2e8f0; }
    .qty-badge { background: rgba(255,255,255,0.07); color: #94a3b8; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }
    .date-cell { font-size: 0.78rem; color: #64748b; }
    .actions-cell { display: flex; gap: 0.5rem; align-items: center; }
    .table-footer { padding: 0.75rem 1rem; border-top: 1px solid rgba(255,255,255,0.05); }
    .count-text { font-size: 0.78rem; color: #475569; }
    .empty-row { text-align: center; color: #475569; padding: 2.5rem !important; font-style: italic; }

    /* Botones */
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 0.55rem 1.3rem; border-radius: 8px; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(99,102,241,0.3); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 25px rgba(99,102,241,0.5); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-outline { background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); padding: 0.55rem 1.2rem; border-radius: 8px; font-weight: 500; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; }
    .btn-outline:hover { background: rgba(255,255,255,0.06); color: #f1f5f9; }
    .btn-estado { background: rgba(99,102,241,0.15); color: #a78bfa; border: 1px solid rgba(99,102,241,0.3); padding: 0.35rem 0.8rem; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-estado:hover { background: rgba(99,102,241,0.3); }
    .btn-danger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 0.35rem 0.7rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; }
    .btn-danger:hover { background: rgba(239,68,68,0.3); }

    /* Status badges */
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; }
    .pendiente { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
    .en_proceso { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
    .completado { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .cancelado { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); text-decoration: line-through; }

    /* VISTA CLIENTE */
    .client-empty { text-align: center; padding: 5rem 2rem; color: #475569; }
    .client-empty span { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .client-empty h3 { font-size: 1.3rem; color: #94a3b8; margin-bottom: 0.5rem; }
    .client-empty p { font-size: 0.9rem; }

    .client-orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.2rem; }
    .order-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.4rem; cursor: pointer; transition: all 0.25s; }
    .order-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.3); border-color: rgba(99,102,241,0.3); }
    .order-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
    .order-product { font-size: 1.05rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.3rem; }
    .order-date { font-size: 0.78rem; color: #64748b; margin-bottom: 1rem; }
    .order-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); }
    .order-qty { font-size: 0.82rem; color: #64748b; }
    .ver-detalle { font-size: 0.82rem; color: #a78bfa; font-weight: 600; }

    /* Timeline horizontal (en tarjeta cliente) */
    .timeline { display: flex; align-items: center; gap: 0; margin: 0.8rem 0; }
    .timeline-step { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
    .timeline-dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s; }
    .timeline-step.done .timeline-dot { background: #6366f1; border-color: #6366f1; box-shadow: 0 0 8px rgba(99,102,241,0.5); }
    .timeline-step.active .timeline-dot { background: #a78bfa; border-color: #a78bfa; box-shadow: 0 0 12px rgba(167,139,250,0.6); }
    .timeline-step span { font-size: 0.65rem; color: #475569; text-align: center; white-space: nowrap; }
    .timeline-step.done span, .timeline-step.active span { color: #94a3b8; }
    .timeline-line { flex: 1; height: 2px; background: rgba(255,255,255,0.1); margin: 0 4px; margin-bottom: 1.1rem; transition: all 0.3s; }
    .timeline-line.done { background: #6366f1; }

    /* Admin comment en tarjeta */
    .admin-comment { display: flex; gap: 0.5rem; align-items: flex-start; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; padding: 0.6rem 0.8rem; margin-top: 0.7rem; }
    .comment-icon { font-size: 0.9rem; flex-shrink: 0; }
    .comment-text { font-size: 0.8rem; color: #a78bfa; font-style: italic; }

    /* MODAL BASE */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal { background: #12121f; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; width: 100%; max-width: 460px; padding: 1.8rem; box-shadow: 0 30px 60px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 1.1rem; max-height: 90vh; overflow-y: auto; }
    .modal-detalle { max-width: 580px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { font-size: 1.05rem; font-weight: 700; color: #f1f5f9; }
    .modal-id { color: #a78bfa; }
    .modal-close { background: none; border: none; color: #64748b; font-size: 1.1rem; cursor: pointer; padding: 0.2rem 0.5rem; transition: color 0.2s; }
    .modal-close:hover { color: #f1f5f9; }
    .modal-product { color: #94a3b8; font-size: 0.9rem; }
    .modal-footer { display: flex; gap: 0.8rem; justify-content: flex-end; margin-top: 0.5rem; }

    /* Estado options */
    .estado-options { display: flex; flex-direction: column; gap: 0.6rem; }
    .estado-option { display: flex; align-items: center; gap: 0.8rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.8rem 1rem; cursor: pointer; transition: all 0.2s; color: #94a3b8; font-weight: 500; }
    .estado-option:hover { background: rgba(255,255,255,0.08); color: #f1f5f9; }
    .estado-option.selected { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.15); color: #a78bfa; }
    .estado-icon { font-size: 1.2rem; }

    /* Comentario admin */
    .comentario-section { display: flex; flex-direction: column; gap: 0.4rem; }
    .comentario-label { font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .comentario-input { min-width: unset; resize: vertical; font-family: inherit; }

    /* MODAL DETALLE */
    .detalle-grid { display: flex; flex-direction: column; gap: 1.2rem; }
    .detalle-section { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .detalle-section-title { font-size: 0.78rem; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.3rem; }
    .detalle-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .detalle-label { font-size: 0.82rem; color: #64748b; font-weight: 500; flex-shrink: 0; }
    .detalle-value { font-size: 0.88rem; color: #f1f5f9; font-weight: 500; text-align: right; }
    .admin-comment-box { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; padding: 0.8rem 1rem; font-size: 0.88rem; color: #a78bfa; font-style: italic; line-height: 1.5; }

    /* Timeline vertical (detalle) */
    .timeline-vertical { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    .tl-item { display: flex; align-items: center; gap: 0.75rem; opacity: 0.35; transition: opacity 0.3s; }
    .tl-item.done { opacity: 1; }
    .tl-dot { font-size: 1.1rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); }
    .tl-item.done .tl-dot { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.4); }
    .tl-content { display: flex; flex-direction: column; gap: 0.1rem; }
    .tl-label { font-size: 0.88rem; font-weight: 600; color: #f1f5f9; }
    .tl-sub { font-size: 0.73rem; color: #64748b; }
  `]
})
export class OrdersComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);
  error = signal('');
  filtroActivo = signal('TODOS');
  busquedaCliente = '';

  nuevoProducto = '';
  nuevaCantidad = 1;

  puedeCrear = false;
  puedeEliminar = false;
  puedeCambiarEstado = false;
  esAdminUOperador = false;
  puedeGestionar = false;

  // Modal estado
  modalAbierto = signal(false);
  pedidoSeleccionado = signal<Pedido | null>(null);
  nuevoEstado = signal('');
  comentarioAdmin = '';

  // Modal detalle
  modalDetalle = signal(false);
  pedidoDetalle = signal<Pedido | null>(null);

  estados = [
    { value: 'PENDIENTE', label: 'Pendiente', icon: '⏳' },
    { value: 'EN_PROCESO', label: 'En Proceso', icon: '🔄' },
    { value: 'COMPLETADO', label: 'Completado', icon: '✅' },
    { value: 'CANCELADO', label: 'Cancelado', icon: '🚫' },
  ];

  filtrosEstado = [
    { label: 'Todos', value: 'TODOS' },
    { label: '⏳ Pendiente', value: 'PENDIENTE' },
    { label: '🔄 En Proceso', value: 'EN_PROCESO' },
    { label: '✅ Completado', value: 'COMPLETADO' },
    { label: '🚫 Cancelado', value: 'CANCELADO' },
  ];

  pedidosFiltrados = computed(() => {
    let lista = this.pedidos();
    if (this.filtroActivo() !== 'TODOS') lista = lista.filter(p => p.estado === this.filtroActivo());
    if (this.esAdminUOperador && this.busquedaCliente.trim()) {
      const q = this.busquedaCliente.toLowerCase();
      lista = lista.filter(p => p.clienteEmail?.toLowerCase().includes(q) || p.clienteNombre?.toLowerCase().includes(q));
    }
    return lista;
  });

  ngOnInit() {
    this.configurarPermisos();
    this.cargarPedidos();
  }

  configurarPermisos() {
    const isAdmin = this.pedidoService.hasRole('Admin');
    const isOperador = this.pedidoService.hasRole('Operador');
    const isCliente = this.pedidoService.hasRole('Cliente');
    this.puedeCrear = isAdmin || isCliente;
    this.puedeEliminar = isAdmin;
    this.puedeCambiarEstado = isAdmin || isOperador;
    this.esAdminUOperador = isAdmin || isOperador;
    this.puedeGestionar = this.puedeCambiarEstado || this.puedeEliminar;
  }

  cargarPedidos() {
    this.cargando.set(true);
    this.error.set('');
    this.pedidoService.getPedidos().subscribe({
      next: (data) => { this.pedidos.set(data); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar pedidos. Verifica tu sesión.'); this.cargando.set(false); }
    });
  }

  setFiltro(v: string) { this.filtroActivo.set(v); }

  getEstadoClass(estado: string | undefined): string {
    if (!estado) return '';
    return estado.toLowerCase().replace('_', '_');
  }

  isEstadoAlcanzado(estadoActual: string | undefined, estadoCheck: string): boolean {
    if (estadoActual === 'CANCELADO') return false;
    const orden = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'];
    return orden.indexOf(estadoActual || '') >= orden.indexOf(estadoCheck);
  }

  crearPedido() {
    this.error.set('');
    this.pedidoService.crearPedido({ producto: this.nuevoProducto, cantidad: this.nuevaCantidad }).subscribe({
      next: () => { this.nuevoProducto = ''; this.nuevaCantidad = 1; this.cargarPedidos(); },
      error: () => this.error.set('Error al crear pedido')
    });
  }

  abrirDetalle(p: Pedido) {
    this.pedidoDetalle.set(p);
    this.modalDetalle.set(true);
  }

  abrirModalEstado(pedido: Pedido) {
    this.pedidoSeleccionado.set(pedido);
    this.nuevoEstado.set(pedido.estado || '');
    this.comentarioAdmin = pedido.comentarioAdmin || '';
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.pedidoSeleccionado.set(null);
    this.comentarioAdmin = '';
  }

  confirmarEstado() {
    const p = this.pedidoSeleccionado();
    if (!p) return;
    this.error.set('');
    this.pedidoService.actualizarEstado(p.id!, this.nuevoEstado(), this.comentarioAdmin).subscribe({
      next: () => { this.cerrarModal(); this.cargarPedidos(); },
      error: () => this.error.set('Error al cambiar estado')
    });
  }

  cancelar(id: number) {
    if (confirm('¿Seguro que deseas CANCELAR este pedido? (No se borrará, solo se marcará como cancelado)')) {
      this.pedidoService.actualizarEstado(id, 'CANCELADO', 'Pedido cancelado por el administrador').subscribe({
        next: () => this.cargarPedidos(),
        error: () => this.error.set('Error al cancelar pedido')
      });
    }
  }
}
