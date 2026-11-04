import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="glass-card table-card">
      <div class="table-responsive">
        <table class="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Total</th>
              <th>📍 Dirección</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="pedidos.length === 0">
              <td colspan="9" class="empty-row">📭 No hay pedidos</td>
            </tr>
            <tr *ngFor="let p of paginatedPedidos()" class="table-row" (click)="onRowClick(p)">
              <td><span class="id-badge">#{{ p.id }}</span></td>
              <td class="client-cell">
                <span class="client-name">{{ p.clienteNombre || '—' }}</span>
                <span class="client-email">{{ p.clienteEmail }}</span>
              </td>
              <td class="product-cell">{{ p.producto }}</td>
              <td><span class="qty-badge">{{ p.cantidad }}</span></td>
              <td class="total-cell">
                <span *ngIf="p.total">\${{ p.total | number }}</span>
                <span *ngIf="!p.total" class="no-data">—</span>
              </td>
              <td class="direccion-cell">
                <span *ngIf="p.direccionEnvio" class="direccion-text">{{ p.direccionEnvio }}</span>
                <span *ngIf="!p.direccionEnvio" class="no-data">Sin dirección</span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="getEstadoClass(p.estado)">
                  {{ getEstadoLabel(p.estado) }}
                </span>
              </td>
              <td class="date-cell">{{ p.fechaCreacion | date:'dd/MM/yy HH:mm' }}</td>
              <td class="actions-cell" (click)="$event.stopPropagation()">
                <button *ngIf="showEditButton" class="btn-estado" (click)="onEditClick(p)">✏ Estado</button>
                <button *ngIf="showCancelButton && p.estado !== 'CANCELADO'" class="btn-danger" (click)="onCancelClick(p.id!)">🚫</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span class="count-text">{{ pedidos.length }} pedido(s) · Pág {{ paginaActual() + 1 }} / {{ totalPaginas() }}</span>
        <div class="pag-controls">
          <button class="pag-btn" (click)="anterior()" [disabled]="paginaActual() === 0">← Anterior</button>
          <button class="pag-btn" (click)="siguiente()" [disabled]="paginaActual() >= totalPaginas() - 1">Siguiente →</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./order-table.component.css']
})
export class OrderTableComponent {
  @Input() pedidos: Pedido[] = [];
  @Input() showEditButton = false;
  @Input() showCancelButton = false;

  @Output() rowClick = new EventEmitter<Pedido>();
  @Output() editClick = new EventEmitter<Pedido>();
  @Output() cancelClick = new EventEmitter<number>();

  readonly PAGE_SIZE = 10;
  paginaActual = signal(0);

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.pedidos.length / this.PAGE_SIZE)));
  readonly paginatedPedidos = computed(() => {
    const start = this.paginaActual() * this.PAGE_SIZE;
    return this.pedidos.slice(start, start + this.PAGE_SIZE);
  });

  anterior() { if (this.paginaActual() > 0) this.paginaActual.update(p => p - 1); }
  siguiente() { if (this.paginaActual() < this.totalPaginas() - 1) this.paginaActual.update(p => p + 1); }

  onRowClick(pedido: Pedido) { this.rowClick.emit(pedido); }
  onEditClick(pedido: Pedido) { this.editClick.emit(pedido); }
  onCancelClick(id: number) { this.cancelClick.emit(id); }

  getEstadoClass(estado: string | undefined): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'estado-pendiente',
      'EN_PROCESO': 'estado-proceso',
      'COMPLETADO': 'estado-completado',
      'CANCELADO': 'estado-cancelado'
    };
    return map[estado || ''] || '';
  }

  getEstadoLabel(estado: string | undefined): string {
    const map: Record<string, string> = {
      'PENDIENTE': '🕐 Pendiente',
      'EN_PROCESO': '⚙️ En Proceso',
      'COMPLETADO': '✅ Completado',
      'CANCELADO': '❌ Cancelado'
    };
    return map[estado || ''] || estado || '—';
  }
}
