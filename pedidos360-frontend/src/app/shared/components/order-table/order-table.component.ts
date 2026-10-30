import { Component, Input, Output, EventEmitter } from '@angular/core';
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
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="pedidos.length === 0">
              <td colspan="7" class="empty-row">No hay pedidos</td>
            </tr>
            <tr *ngFor="let p of pedidos" class="table-row" (click)="onRowClick(p)">
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
                <button *ngIf="showEditButton" class="btn-estado" (click)="onEditClick(p)">✏ Estado</button>
                <button *ngIf="showCancelButton && p.estado !== 'CANCELADO'" class="btn-danger" (click)="onCancelClick(p.id!)">🚫 Cancelar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span class="count-text">{{ pedidos.length }} pedido(s)</span>
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

  onRowClick(pedido: Pedido) {
    this.rowClick.emit(pedido);
  }

  onEditClick(pedido: Pedido) {
    this.editClick.emit(pedido);
  }

  onCancelClick(id: number) {
    this.cancelClick.emit(id);
  }

  getEstadoClass(estado: string | undefined): string {
    if (!estado) return '';
    return estado.toLowerCase().replace('_', '_');
  }
}
